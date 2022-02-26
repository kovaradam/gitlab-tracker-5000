import React, { useEffect } from 'react';
import styled from 'styled-components';
import { NewEntryDialog } from '../components/NewEntryDialog';
import { Logo } from '../components/Logo';
import { Timer } from '../components/Timer';
import { UserIcon } from '../components/UserIcon';
import { useTimestamp } from '../store/use-timestamp';
import { createStorage } from '../utils/storage';
import { UserProvider } from '../store/use-user';
import { MdOutlineAddTask } from 'react-icons/md';
import { AddTimeDialog } from '../components/AddTimeDialog';
import { useToggle } from '../utils/use-toggle';
import { Dashboard } from '../components/Dashboard';
import { DialogModal } from '../components/DialogModal';
import { dots } from '../style/animation';
import { mediaQueries } from '../style/media-queries';
import { withIssues } from '../components/Dashboard/use-issues';
import { InfoBox, useRegisterInfoBox } from '../components/InfoBox';

const trackedTimeStorage = createStorage('tracked-time');

const initLastTimestamp = trackedTimeStorage.get();

export const Main = withIssues(() => {
  const {
    timestamp,
    startTimer,
    stopTimer,
    isLoading: isTimestampLoading,
  } = useTimestamp();
  const [trackedTime, setTrackedTime] = React.useState<number | null>(
    !!initLastTimestamp ? Number(initLastTimestamp) : null,
  );

  const [isAddTimeDialogVisible, timeDialogToggle] = useToggle(false);
  const [isSuccessAlertVisible, successAlertToggle] = useToggle(false);

  useEffect(() => {
    if (trackedTime === null) {
      trackedTimeStorage.delete();
    } else {
      trackedTimeStorage.set(String(trackedTime));
    }
  }, [trackedTime]);

  const handleStopButton = (): void => {
    if (!timestamp) {
      throw Error('Stopping timer without init timestamp');
    }
    setTrackedTime(new Date().getTime() - timestamp);
    stopTimer();
  };

  const handleStartButton = (): void => {
    setTrackedTime(null);
    startTimer();
  };

  const discardEntry = (success = false): void => {
    setTrackedTime(null);
    successAlertToggle.set(success);
  };

  const isEntryDialogVisible = trackedTime !== null;

  const registerStartButtonInfo = useRegisterInfoBox('Start timer');

  return (
    <UserProvider>
      <S.Header>
        <S.AddTimeButton
          onClick={timeDialogToggle.on}
          {...useRegisterInfoBox('Add timelog')}
        >
          <MdOutlineAddTask />
        </S.AddTimeButton>
        <S.Logo />
        <S.UserIcon />
      </S.Header>
      <S.Main>
        <S.Timer timestamp={timestamp} stopTimer={handleStopButton} />
        {timestamp === null && (
          <S.StartTimerButton
            onClick={handleStartButton}
            data-loading={isTimestampLoading}
            disabled={isTimestampLoading}
            {...registerStartButtonInfo}
          >
            <span>Start</span>
          </S.StartTimerButton>
        )}
        {isEntryDialogVisible && (
          <NewEntryDialog
            trackedTime={trackedTime}
            setTrackedTime={setTrackedTime}
            discardEntry={discardEntry}
          />
        )}
        <S.Dashboard />
        {isAddTimeDialogVisible && (
          <AddTimeDialog hide={timeDialogToggle.off} setTrackedTime={setTrackedTime} />
        )}
        {isSuccessAlertVisible && (
          <S.SuccessAlert hide={successAlertToggle.off}>
            Timelogs successfully submitted!
          </S.SuccessAlert>
        )}
        <S.InfoBox />
      </S.Main>
    </UserProvider>
  );
});

const S = {
  Header: styled.header`
    height: var(--header-height);
    color: var(--main-color);
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 20vw 1fr 20vw;
    justify-items: center;
    align-items: center;
    box-shadow: var(--baseShadow);

    & > button {
      border-radius: 3px;
      --size: 2.5rem;
      width: var(--size);
      height: var(--size);
    }
  `,
  Logo: styled(Logo)`
    grid-column: 2 / 3;
    width: min-content;
    & h1 {
      font-size: 1.2rem;
    }
  `,
  AddTimeButton: styled.button`
    font-size: 2rem;
    background-color: white;
    color: var(--main-color);
    border: 1px dashed var(--main-color);
    padding: 0 0.5rem;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;

    @media ${mediaQueries.desktop} {
      position: absolute;
      left: var(--desktop-padding);
    }
  `,
  UserIcon: styled(UserIcon)`
    grid-column: 3;
    @media ${mediaQueries.desktop} {
      position: absolute;
      right: var(--desktop-padding);
    }
  `,
  Main: styled.main`
    display: grid;
    grid-template-rows: 1fr 70% 1fr;
    height: calc(100% - var(--header-height));
    width: 100%;
    background-color: white;
    --pattern-color: #ffecee;
    background-image: linear-gradient(var(--pattern-color) 1px, transparent 1px),
      linear-gradient(to right, var(--pattern-color) 1px, white 1px);
    background-size: 10px 10px;
  `,
  SuccessAlert: styled(DialogModal)`
    height: min-content;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    padding: 1rem;
    text-align: center;
  `,
  Dashboard: styled(Dashboard)`
    grid-row: 1 / 3;
    @media ${mediaQueries.desktop} {
      grid-row: 1 / 5;
    }
  `,
  StartTimerButton: styled.button`
    background-color: var(--main-color);
    color: white;
    width: 100%;
    padding: 1rem;
    font-size: 1.3rem;
    font-weight: 600;
    grid-area: 3;
    align-self: center;
    justify-self: center;
    width: 50%;
    margin-bottom: 1rem;
    z-index: 2;

    &[data-loading='true']:after {
      content: '.';
      animation: ${dots} 2s linear infinite;
    }

    &[data-loading='true'] > span {
      display: none;
    }

    @media ${mediaQueries.desktop} {
      grid-column: 2;
      grid-row: 1;
      width: 15rem;
      position: absolute;
      top: 6rem;
      right: 3rem;
    }
  `,
  Timer: styled(Timer)`
    z-index: 2;
    bottom: 1rem;
  `,
  InfoBox: styled(InfoBox)`
    display: none;
    @media ${mediaQueries.desktop} {
      display: initial;
      position: absolute;
      z-index: 2;
      bottom: 0;
      left: 0;
      padding: 0.4rem;
      font-size: 1rem;

      &:empty {
        display: none;
      }
    }
  `,
};

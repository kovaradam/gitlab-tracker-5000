import React, { useEffect } from 'react';
import styled from 'styled-components';
import { NewEntryDialog } from '../components/NewEntryDialog';
import { Logo } from '../components/Logo';
import { Timer } from '../components/Timer';
import { UserIcon } from '../components/UserIcon';
import { QueryProvider } from '../store/use-query';
import { useTimestamp } from '../store/use-timestamp';
import { createStorage } from '../utils/storage';
import { UserProvider } from '../store/use-user';
import { MdOutlineAddTask } from 'react-icons/all';
import { AddTimeDialog } from '../components/AddTimeDialog';
import { useToggle } from '../utils/use-toggle';
import { Dashboard } from '../components/Dashboard';
import { DialogModal } from '../components/DialogModal';

const trackedTimeStorage = createStorage('tracked-time');

const initLastTimestamp = trackedTimeStorage.get();

export const Main: React.FC = () => {
  const { timestamp, startTimer, stopTimer } = useTimestamp();
  const [trackedTime, setTrackedTime] = React.useState<number | null>(
    initLastTimestamp !== null ? Number(initLastTimestamp) : null,
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

  const discardIssue = (success = false): void => {
    setTrackedTime(null);
    successAlertToggle.set(success);
  };

  const isEntryDialogVisible = trackedTime !== null;

  return (
    <QueryProvider>
      <UserProvider>
        <S.Header>
          <S.AddTimeButton onClick={timeDialogToggle.on}>
            <MdOutlineAddTask />
          </S.AddTimeButton>
          <S.Logo />
          <S.UserIcon />
        </S.Header>
        <S.Main>
          <S.Timer timestamp={timestamp} stopTimer={handleStopButton} />
          {timestamp === null && (
            <S.StartTimerButton onClick={handleStartButton}>Start</S.StartTimerButton>
          )}
          {isEntryDialogVisible ? (
            <NewEntryDialog
              trackedTime={trackedTime}
              setTrackedTime={setTrackedTime}
              discardEntry={discardIssue}
            />
          ) : (
            <S.Dashboard />
          )}
          {isAddTimeDialogVisible && (
            <AddTimeDialog hide={timeDialogToggle.off} setTrackedTime={setTrackedTime} />
          )}
          {isSuccessAlertVisible && (
            <S.SuccessAlert hide={successAlertToggle.off}>
              Timelogs successfully submitted!
            </S.SuccessAlert>
          )}
        </S.Main>
      </UserProvider>
    </QueryProvider>
  );
};

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
  `,
  UserIcon: styled(UserIcon)`
    grid-column: 3;
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
    z-index: 1;
  `,
  Timer: styled(Timer)`
    z-index: 2;
    bottom: 1rem;
  `,
};

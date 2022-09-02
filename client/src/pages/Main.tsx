import React from 'react';
import styled from 'styled-components';
import { NewEntryDialog } from '../components/NewEntryDialog';
import { Logo } from '../components/Logo';
import { Timer } from '../components/Timer';
import { UserIcon } from '../components/UserIcon';
import { trackedTimeStorage, useTimestamp } from '../store/use-timestamp';
import { MdOutlineAddTask } from 'react-icons/md';
import { AddTimeDialog } from '../components/AddTimeDialog';
import { Dashboard } from '../components/Dashboard';
import { DialogModal } from '../components/DialogModal';
import { dots } from '../style/animation';
import { mediaQueries } from '../style/media-queries';
import { InfoBox, useRegisterInfoBox } from '../components/InfoBox';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

export function Main(): JSX.Element {
  const timer = useTimestamp();
  const navigate = useNavigate();

  const handleStopButton = (): void => {
    if (!timer.timestamp) {
      throw Error('Stopping timer without init timestamp');
    }
    const trackedTime = new Date().getTime() - timer.timestamp;
    timer.stopTimer();
    navigate(`/new/${trackedTime}`);
  };

  const handleStartButton = (): void => {
    timer.startTimer();
  };

  const registerStartButtonInfo = useRegisterInfoBox('Start timer');

  const persistedTrackedTime = Number(trackedTimeStorage.get());

  return (
    <>
      <S.Header>
        <S.AddTimeButton to="add" {...useRegisterInfoBox('Add timelog')}>
          <MdOutlineAddTask />
        </S.AddTimeButton>
        <S.Logo />
        <S.UserIcon />
      </S.Header>
      <S.Main>
        <S.Timer timestamp={timer.timestamp} stopTimer={handleStopButton} />
        {timer.timestamp === null && (
          <S.StartTimerButton
            onClick={handleStartButton}
            data-loading={timer.isLoading}
            disabled={timer.isLoading}
            {...registerStartButtonInfo}
          >
            <span>Start</span>
          </S.StartTimerButton>
        )}

        <S.Dashboard />
        <Routes>
          <Route
            index
            element={
              Boolean(persistedTrackedTime) && (
                <Navigate to={getNewEntryPath(persistedTrackedTime)} />
              )
            }
          />
          <Route
            path="add"
            element={
              <AddTimeDialog
                hide={(): void => navigate('/')}
                setTrackedTime={(newTrackedTime): void =>
                  navigate(getNewEntryPath(newTrackedTime ?? 0))
                }
              />
            }
          />
          <Route
            path="new/:trackedTime"
            element={
              <>
                <NewEntryDialog
                  setTrackedTime={(newTrackedTime): void =>
                    navigate(getNewEntryPath(newTrackedTime))
                  }
                  hide={(): void => {
                    trackedTimeStorage.delete();
                    navigate('/');
                  }}
                  onSuccess={(): void => navigate('/success')}
                />
              </>
            }
          />
          <Route
            path="success"
            element={
              <S.SuccessAlert hide={(): void => navigate('/', { replace: true })}>
                Timelogs successfully submitted!
              </S.SuccessAlert>
            }
          />
        </Routes>

        <S.InfoBox />
      </S.Main>
    </>
  );
}

function getNewEntryPath(trackedTime: number): string {
  return `/new/${trackedTime}`;
}

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

    & > button,
    & > a {
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
  AddTimeButton: styled(Link)`
    border: none;
    transition: all 100ms;
    box-shadow: var(--base-shadow);

    font-size: 1.5rem;
    background-color: white;
    color: var(--main-color);
    border: 1px dashed var(--main-color);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:active {
      box-shadow: none;
      transform: translate(var(--shadow-offset), var(--shadow-offset));
    }

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

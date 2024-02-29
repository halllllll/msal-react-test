import React, { FC, Suspense } from 'react';
import { UserData } from './userdata';
import { Chat20, DonwloadsChats, PagenateChats } from './AllChats';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './error-boundary';
import { useMyAppContext } from '../context/hook';
import { RadioButtonGroup } from './radiobuttons';
import { viewType } from '../context/hook';

export const Home: FC = () => {
  const {setMyAppCtx, MyAppCtx} = useMyAppContext()
  
  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMyAppCtx({type: event.target.value as typeof viewType[number]})
  }
  return (
    <>
      <UserData />

      <div>
        <p>teams (beloging) chats list</p>
        <RadioButtonGroup options={viewType} selectedOption={null} onChange={changeHandler} />
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              setMyAppCtx({type: "null"})
            }}
          >
            <Suspense fallback={<h2>wait...</h2>}>  
              {MyAppCtx.view === "first" ? (
                <Chat20 />
              ) : MyAppCtx.view === "pagenate" ? (
                <PagenateChats />
              ) : MyAppCtx.view === "download" ? (
                <DonwloadsChats />
              ) : null}
            </Suspense>
          </ErrorBoundary>
      </div>
    </>
  );
};

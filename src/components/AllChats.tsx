import { ErrorBoundary } from 'react-error-boundary';
import { useGetChatsFirst20, useGetChatsPaginate } from '../funcs/funcs';
import { FC, Suspense, useState } from 'react';
import { ErrorFallback } from './error-boundary';
import Excel from "exceljs"
import {saveAs} from "file-saver"

export const Chat20: FC = () => {
  const { data, isError } = useGetChatsFirst20();
  if (isError) {
    throw new Error('失敗！');
  }
  const countpropertyname = '@odata.count';
  const count = data[countpropertyname as keyof typeof data];
  // const linkpropertyname = "@odata.nextLink"
  //  const nextlink = data[linkpropertyname as keyof typeof data]
  const nextlink = data['@odata.nextLink'];

  return (
    <div>
      <p>yay~</p>
      <p>{`count: ${count}`}</p>
      <table>
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Type</th>
            <th scope="col">ID</th>
            <th scope="col">topic</th>
            <th scope="col">createdat</th>
            <th scope="col">updatedat</th>
            <th scope="col">url</th>
          </tr>
        </thead>
        <tbody>
          {data?.value?.map((v, idx) => {
            return (
              <tr key={v.id}>
                <td>{idx + 1}</td>
                <td>{v.chatType}</td>
                <td>{v.id}</td>
                <td>{v.topic}</td>
                <td>{v.createdDateTime}</td>
                <td>{v.lastUpdatedDateTime}</td>
                <td>{v.webUrl}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {nextlink ? (
        <div>
          次のリンクはこれ - <b>{nextlink}</b>
        </div>
      ) : (
        <div>終了</div>
      )}
      <button type={'reset'}>やりなおし？</button>
    </div>
  );
};

export const PagenateChats: FC = () => {
  const { data, isPending, isFetching, hasNextPage, fetchNextPage, isError, error } =
    useGetChatsPaginate();
  console.error(error);
  const count = data.count;

  return (
    <>
      {isPending && <h3>取得中...</h3>}
      <div>
        {isError ? (
          <div>失敗！</div>
        ) : (
          <div>
            <p>{`count: ${count}`}</p>
            <table>
              <thead>
                <tr>
                  <th scope="col">No.</th>
                  <th scope="col">Type</th>
                  <th scope="col">ID</th>
                  <th scope="col">topic</th>
                  <th scope="col">createdat</th>
                  <th scope="col">updatedat</th>
                  <th scope="col">url</th>
                </tr>
              </thead>
              <tbody>
                {data.result.map((v, idx) => {
                  return (
                    <>
                      <tr key={v?.id}>
                        <td>{idx + 1}</td>
                        <td>{}</td>
                        <td>{v?.id}</td>
                        <td>{v?.topic}</td>
                        <td>{v?.createdat}</td>
                        <td>{v?.updatedat}</td>
                        <td>{v?.url}</td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
            {hasNextPage ? (
              <button
                type="button"
                onClick={() => {
                  fetchNextPage();
                }}
                disabled={isFetching}
              >
                {isFetching ? '取得中...' : '続けて取得する'}
              </button>
            ) : (
              <div>終了</div>
            )}
            <button type={'reset'}>やりなおし？</button>
          </div>
        )}
      </div>
    </>
  );
};



const DownloadLink: FC = () => {
  const { data, isPending, hasNextPage, fetchNextPage, error} =
    useGetChatsPaginate();
  console.error(error);
  const [onSave, setOnSave] = useState<boolean>(false)

  if(hasNextPage)fetchNextPage();

  const save = async () => {
    setOnSave(false)
    const workbook = new Excel.Workbook();
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("chats");
    worksheet.columns = [{header: "name", key: "topic"}, {header: "id", key: "id", }, {header: "type", key: "type"}, {header: "url", key: "url"}]
    worksheet.addRows(data.result.map(v => {return {topic: v?.topic, id: v?.id, type: v?.type, url: v?.url}}))
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]),  "allchats.xlsx")
    setOnSave(true)
  }
  const count = data.count;
  return (
    <div>
      {isPending ? (
        <>{`取得中... 現在: ${count}`}</>
      ) : (
        <>
          <div>{`取得完了 ${count}`}</div>
          {!hasNextPage && (
            <button type="button" onClick={save} disabled={onSave}>ダウンロード</button>
          )}
          <table>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Type</th>
                <th scope="col">ID</th>
                <th scope="col">topic</th>
                <th scope="col">createdat</th>
                <th scope="col">updatedat</th>
                <th scope="col">url</th>
              </tr>
            </thead>
            <tbody>
              {data.result.map((v, idx) => {
                return (
                  <>
                    <tr key={v?.id}>
                      <td>{idx + 1}</td>
                      <td>{v?.type}</td>
                      <td>{v?.id}</td>
                      <td>{v?.topic}</td>
                      <td>{v?.createdat}</td>
                      <td>{v?.updatedat}</td>
                      <td>{v?.url}</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export const DonwloadsChats: FC = () => {
  const [preparing, setPreparing] = useState<boolean>(false);
  return (
    <div>
      {!preparing ? (
        <button type="button" onClick={()=>setPreparing(true)}>xlsxでChatを保存</button>
      ) : (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<h2>wait...</h2>}>
            <DownloadLink />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};

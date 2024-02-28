import { useGetChatsFirst20, useGetChatsPaginate } from '../funcs/funcs';
import { FC } from 'react';

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

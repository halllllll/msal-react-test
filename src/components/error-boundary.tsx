import { FC } from "react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const err = error as Error;
  return (
    <div>
      <h2>エラー発生: {err.name} {err.message}</h2>
      <button
        type="button"
        onClick={() => {
          resetErrorBoundary();
        }}
      >
        エラーをクリア
      </button>
    </div>
  );
};
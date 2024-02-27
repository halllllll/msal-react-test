import React, { type FC } from "react";

type Props = {
  options: readonly string[],
  selectedOption: string | null
  onChange: (event: React.ChangeEvent<HTMLInputElement>)=>void
}
export const RadioButtonGroup: FC<Props> = ({ options, selectedOption, onChange }) => {
  return (
    <div>
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            value={option}
            checked={selectedOption === option}
            onChange={onChange}
          />
          {option}
        </label>
      ))}
    </div>
  );
}
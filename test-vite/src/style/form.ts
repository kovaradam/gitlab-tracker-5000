import styled from 'styled-components';

export const FormStyle = {
  Fieldset: styled.fieldset`
    display: flex;
    justify-content: center;
    align-items: baseline;
    flex-direction: column;
    padding: 0;
    gap: 0.5rem;
    border: none;
    color: var(--secondary-color);
    &:focus-within {
      color: var(--main-color);
    }
  `,
  Label: styled.label`
    color: inherit;
    position: relative;
    font-size: 1rem;

    *[data-error='true'] & {
      color: red;
      &::after {
        content: '!';
        position: absolute;
        top: -2px;
        left: 104%;
        border: 1px solid red;
        border-radius: 50%;
        width: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: scale(0.7);
      }
    }
  `,
  Input: styled.input`
    border: 2px dotted var(--secondary-color);
    padding: 1rem;
    outline: none;
    transition: all 100ms;

    *[data-error='true'] > & {
      border-color: red;
    }

    &:focus {
      border-color: var(--main-color);
      transform: scale(1.05);
    }
  `,
  Submit: styled.button.attrs({ type: 'submit' })`
    background-color: var(--main-color);
    color: white;
    width: 100%;
    padding: 1rem;
    font-size: 1.3rem;
    font-weight: 600;

    &[disabled] {
      background-color: #eca6ad;
    }
  `,
};

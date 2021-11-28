import React from 'react';
import './show.css';

type Props = { className?: string };

export const AnimatedValue: React.FC<Props> = ({ children, ...props }) => {
  const prevValue = React.useRef(children);
  const wrapperElement = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const diff = prevValue.current !== children;
    prevValue.current = children;
    if (!wrapperElement.current || !diff) {
      return;
    }
    const element = wrapperElement.current;
    element.style.animation = `show 500ms`;

    setTimeout(() => {
      element.style.animation = '';
    }, Number(element.style.animationDuration.replace(/\D+/, '')));
  }, [children]);

  return (
    <>
      <span ref={wrapperElement} {...props}>
        {children}
      </span>
    </>
  );
};

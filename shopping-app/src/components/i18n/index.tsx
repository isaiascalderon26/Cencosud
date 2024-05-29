import React, { HTMLAttributes } from 'react';
import { Localize } from '../../lib/i18n.proposal';

interface Props<L extends string = any, R = string>
  extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'label' | 'caption' | 'div' | 'p' | 'span';
  localize: Localize<L, R>;
  replacements?: any;
  id: L;
}

function I18n<L extends string = any, R = string>({
  variant: V = 'div',
  localize,
  id,
  replacements,
  ...props
}: Props<L, R>) {
  return (
    <V {...props} {...{ 'i18n-label': id }}>
      {localize(id, replacements) ?? id}
    </V>
  );
}

export const i18nFactory =
  <L extends string = any, R = string>(localize: Localize<L, R>) =>
  (props: Omit<Props<L, R>, 'localize'>) =>
    <I18n {...props} localize={localize} />;

export default I18n;

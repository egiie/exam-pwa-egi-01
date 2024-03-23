import React from 'react';
import { get as _get } from 'lodash';
import cx from 'classnames';

const WelcomeMessage = (props) => {
    const {
        storeConfig,
    } = props;

    const welcomeMessageText = _get(storeConfig, 'welcome');
    if (welcomeMessageText) {
        return (
            <>
                <div
                    id="welcome-text-message"
                    className={cx(
                        'welcome-text-message',
                        'h-[38px]',
                        'flex',
                        'items-center',
                        'justify-center',
                        'font-normal',
                        'tablet:text-base',
                        'mobile:max-tablet:text-sm',
                        'bg-primary-500',
                        'text-neutral-white',
                        'mobile:max-tablet:py-1',
                    )}
                >
                    {welcomeMessageText}
                </div>
            </>
        );
    }

    return null;
};

export default WelcomeMessage;

import cx from 'classnames';

const BadgeCounter = (props) => {
    const { className, value = 0, children } = props;

    return (
        <>
            <button type="button">{children}</button>
            <div
                className={cx(
                    'relative',
                    'inline-flex',
                    'items-center',
                    'justify-center',
                    'w-4',
                    'h-4',
                    'text-[8px]',
                    'text-neutral-white',
                    'bg-primary-500',
                    'rounded-full',
                    '-top-4',
                    'end-2',
                    className,
                )}
            >
                {value}
            </div>
        </>
    );
};

export default BadgeCounter;

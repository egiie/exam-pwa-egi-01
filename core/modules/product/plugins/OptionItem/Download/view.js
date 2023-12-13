/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/label-has-associated-control */
// import { formatPrice } from '@helper_currency';

import Footer from '@plugin_optionitem/components/Footer';

const Checkbox = ({
    val, handleOption, disabled,
}) => (
    <div className="options-container">
        <input
            type="checkbox"
            onClick={() => !disabled && handleOption(val.id, val.price)}
            id={val.id}
            name={val.id}
            value={val.id}
            defaultChecked={val.is_default}
            disabled={disabled}
        />
        <label
            className="label-options"
            htmlFor={val.id}
            dangerouslySetInnerHTML={{
                __html: `${val.title} + <b>${val.price}</b>`,
            }}
        />
        <br />
        <hr />
    </div>
);

const DownloadView = (props) => {
    const {
        items, handleOption, disabled, loading,
        showQty = true, qty, setQty, handleAddToCart, t,
        showAddToCart = true, CustomFooter, ...other
    } = props;
    const setLoading = !(loading === 0 || loading === false);
    return (
        <>
            <div className="options-container">
                {items.map((val, key) => (
                    <Checkbox disabled={disabled} val={val} key={key} handleOption={handleOption} />
                ))}
                <br />
            </div>
            {
                React.isValidElement(CustomFooter)
                    ? React.cloneElement(CustomFooter, {
                        ...other,
                        loading: setLoading,
                        disabled,
                        showQty,
                        handleAddToCart,
                        qty,
                        setQty,
                        t,
                        showAddToCart,
                    })
                    : (
                        <Footer
                            loading={setLoading}
                            disabled={disabled}
                            showQty={showQty}
                            handleAddToCart={handleAddToCart}
                            qty={qty}
                            setQty={setQty}
                            t={t}
                            showAddToCart={showAddToCart}
                            {...other}
                        />
                    )
            }
        </>
    );
};

export default DownloadView;

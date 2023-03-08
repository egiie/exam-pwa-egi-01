/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-unused-vars */
import React from 'react';
import Skeleton from '@common_skeleton';
import Typography from '@common_typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GenerateFilter from '@plugin_productlist/components/FilterDesktop/filter';
import useStyles from '@plugin_productlist/components/FilterDesktop/style';

const ViewFilter = (props) => {
    const {
        itemProps = {},
        elastic = false,
        t,
        tabs,
        loading,
        priceRange,
        setPriceRange,
        selectedFilter,
        setCheckedFilter,
        setSelectedFilter,
        handleSave,
        onChangeTabs,
        isSearch,
        filter,
        storeConfig,
    } = props;
    const styles = useStyles();

    return (
        <div className={styles.root}>
            {loading ? <Skeleton variant="rect" width="100%" height={705} /> : null}
            {tabs && tabs.length > 0 ? (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                        <Typography className={styles.heading}>{t('catalog:title:category')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ul>
                            {tabs.map((val, idx) => {
                                if (val !== 'attribute_set_id') {
                                    return (
                                        <li onClick={(e) => onChangeTabs(e, idx + 1)} className={styles.listCategory} key={idx}>
                                            <Typography variant="span" letter="capitalize">
                                                {val.replace(/_/g, ' ')}
                                            </Typography>
                                        </li>
                                    );
                                }

                                return null;
                            })}
                        </ul>
                    </AccordionDetails>
                </Accordion>
            ) : null}
            {filter
                && filter.map((itemFilter, idx) => {
                    if ((itemFilter.field === 'cat' || itemFilter.field === 'attribute_set_id') && !isSearch) {
                        return <span key={idx} />;
                    }
                    return (
                        <Accordion key={idx} defaultExpanded={typeof selectedFilter[itemFilter.field] !== 'undefined'}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                <Typography className={styles.heading} variant="span" letter="capitalize">
                                    {itemFilter.label.replace(/_/g, ' ')}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <GenerateFilter
                                    itemFilter={itemFilter}
                                    idx={idx}
                                    {...props}
                                />
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
        </div>
    );
};

export default ViewFilter;

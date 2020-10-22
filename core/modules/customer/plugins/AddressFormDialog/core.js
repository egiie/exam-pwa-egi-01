/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { regexPhone } from '@helper_regex';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { groupingCity, groupingSubCity } from '@helpers/city';
import { modules } from '@config';
import { getCityByRegionId, getCountries as getAllCountries } from '../../services/graphql';

const AddressFormDialog = (props) => {
    const {
        firstname = '',
        lastname = '',
        street = '',
        postcode = '',
        country = 'ID',
        region = null,
        city = null,
        telephone = '',
        maps = '',
        open,
        t,
        onSubmitAddress,
        loading = false,
        success = false,
        defaultShipping = false,
        defaultBilling = false,
        addressId = null,
        setOpen,
        latitude,
        longitude,
        pageTitle,
        disableDefaultAddress = false,
        Content,
        storeConfig,
    } = props;

    const gmapKey = (storeConfig || {}).icube_pinlocation_gmap_key;

    const [getCountries, gqlCountries] = getAllCountries();
    const [addressState, setAddressState] = useState({
        countries: null,
        dropdown: {
            countries: null,
            region: null,
            city: null,
            district: null,
            village: null,
        },
        value: {
            country: { id: '', label: '' },
            region: { id: '', label: '' },
            city: { id: '', label: '' },
        },
    });

    const [isFromUseEffect, setFromUseEffect] = useState(false);

    const getRegionByLabel = (label, dataRegion = null) => {
        const data = dataRegion || addressState.dropdown.region;
        return data.find((item) => item.label === label) ? data.find((item) => item.label === label) : null;
    };

    const getRegionByCountry = (dataCountry, countries = null) => {
        let data = countries || addressState.countries;
        data = data.find((item) => item.id === dataCountry);

        if (data) {
            if (data.available_regions) {
                return data.available_regions.map((item) => ({
                    ...item,
                    label: item.name,
                }));
            }
        }

        return null;
    };

    const getCountryByCode = (code, countries = null) => {
        let data = countries || addressState.dropdown.countries;
        data = data.find((item) => item.id === code);
        return data || null;
    };

    const getCityByLabel = (label, dataCity = null) => {
        const data = dataCity || addressState.dropdown.city;
        return data.find((item) => item.label === label) ? data.find((item) => item.label === label) : null;
    };

    const splitCityValue = (cityValue) => cityValue.split(', ');

    const [mapPosition, setMapPosition] = useState({
        lat: latitude || '-6.197361',
        lng: longitude || '106.774535',
    });

    const displayLocationInfo = (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        setMapPosition({
            lat,
            lng,
        });
    };

    const handleDragPosition = (value) => {
        setMapPosition(value);
    };

    const ValidationAddress = {
        firstname: Yup.string().required(t('validate:firstName:required')),
        lastname: Yup.string().required(t('validate:lastName:required')),
        telephone: Yup.string().required(t('validate:telephone:required')).matches(regexPhone, t('validate:phoneNumber:wrong')),
        street: Yup.string().required(t('validate:street:required')),
        postcode: Yup.string().required(t('validate:postal:required')).min(3, t('validate:postal:wrong')).max(20, t('validate:postal:wrong')),
        country: Yup.string().nullable().required(t('validate:country:required')),
        region: Yup.string().nullable().required(t('validate:state:required')),
        city: Yup.string().nullable().required(t('validate:city:required')),
    };

    const InitialValue = {
        firstname: firstname || '',
        lastname: lastname || '',
        telephone: telephone || '',
        street: street || '',
        country: '',
        region: '',
        city: '',
        postcode: postcode || '',
        maps: maps || '',
        defaultBilling: defaultBilling || false,
        defaultShipping: defaultShipping || false,
        regionCode: '',
        regionId: '',
    };

    // add initial value if split city enabled
    if (modules.customer.plugin.address.splitCity) {
        ValidationAddress.district = Yup.string().nullable().required('Kecamatan');
        ValidationAddress.village = Yup.string().nullable().required('Kelurahan');

        InitialValue.district = '';
        InitialValue.village = '';
    }

    const AddressSchema = Yup.object().shape(ValidationAddress);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: InitialValue,
        validationSchema: AddressSchema,
        onSubmit: async (values) => {
            const data = {
                ...values,
                countryCode: values.country.id,
                region: values.region && values.region.code ? values.region.code : values.region,
                regionCode: values.region && values.region.code ? values.region.code : null,
                regionId: values.region && values.region.code ? values.region.id : null,
                addressId,
                latitude: String(mapPosition.lat),
                longitude: String(mapPosition.lng),
            };

            if (modules.customer.plugin.address.splitCity) {
                data.city = values.village && values.village.city ? values.village.city : values.id;
            } else {
                data.city = values.city && values.city.label ? values.city.label : values.city;
            }

            const type = addressId ? 'update' : 'add';

            // remove split values
            delete data.district;
            delete data.village;
            if (onSubmitAddress) {
                onSubmitAddress(data, type);
            }
        },
    });

    const [getCities, responCities] = getCityByRegionId({});

    useEffect(() => {
        const state = { ...addressState };

        formik.setFieldValue('country', country);
        formik.setFieldValue('region', region);

        getCountries();
        if (gqlCountries.data && open) {
            state.countries = gqlCountries.data.countries;
            state.dropdown.countries = state.countries.map((item) => ({
                id: item.id,
                label: item.full_name_locale,
                available_regions: item.available_regions,
            }));

            if (country) {
                state.dropdown.region = getRegionByCountry(country, gqlCountries.data.countries);
                formik.setFieldValue('country', getCountryByCode(country, state.dropdown.countries));
            }
            setAddressState(state);

            if (state.dropdown.region && state.dropdown.region.length && region) {
                const selectedRegion = getRegionByLabel(region);
                formik.setFieldValue('region', selectedRegion);
                if (selectedRegion) {
                    setFromUseEffect(true);
                    getCities({ variables: { regionId: selectedRegion.id } });
                }
            } else {
                formik.setFieldValue('city', city);
            }
        }

        // only set current location for add mode
        if (navigator.geolocation && !addressId) {
            return navigator.geolocation.getCurrentPosition(displayLocationInfo);
        }

        // update map position after edit data
        if (open && latitude && longitude) {
            setMapPosition({
                lat: latitude,
                lng: longitude,
            });
        }
    }, [open]);

    // set city and grouping
    useEffect(() => {
        if (responCities.data && !responCities.loading && !responCities.error) {
            const state = { ...addressState };
            const { data } = responCities;
            if (data.getCityByRegionId.item.length !== 0) {
                if (modules.customer.plugin.address.splitCity) {
                    state.dropdown.city = groupingCity(data.getCityByRegionId.item);
                    state.dropdown.district = null;
                    state.dropdown.village = null;
                    // get default value by split city
                    if (city && !formik.values.city) {
                        const defaultValue = splitCityValue(city);
                        formik.setFieldValue('city', getCityByLabel(defaultValue[0], state.dropdown.city));
                    }

                    formik.setFieldValue('district', '');
                    formik.setFieldValue('village', '');
                    formik.setFieldValue('postcode', '');
                } else {
                    state.dropdown.city = data.getCityByRegionId.item.map((item) => ({ ...item, id: item.id, label: item.city }));
                    formik.setFieldValue('city', getCityByLabel(city, state.dropdown.city));
                }
            } else {
                state.dropdown.city = null;
                formik.setFieldValue('city', null);
                if (isFromUseEffect) {
                    formik.setFieldValue('city', city);
                    setFromUseEffect(false);
                }
            }

            setAddressState(state);
        }
    }, [responCities]);

    // get kecamatan if city change
    React.useMemo(() => {
        if (formik.values.city) {
            if (modules.customer.plugin.address.splitCity) {
                const { data } = responCities;
                const district = groupingSubCity(formik.values.city.label, 'district', data.getCityByRegionId.item);
                const state = { ...addressState };
                state.dropdown.district = district;
                state.dropdown.village = null;
                if (city && !formik.values.district) {
                    const defaultValue = splitCityValue(city);
                    formik.setFieldValue('district', getCityByLabel(defaultValue[1], state.dropdown.district));
                } else {
                    // reset village and district if change city
                    formik.setFieldValue('district', '');
                    formik.setFieldValue('village', '');
                    formik.setFieldValue('postcode', '');
                }
                setAddressState(state);
            } else {
                formik.setFieldValue('postcode', formik.values.city.postcode);
            }
        }
    }, [formik.values.city]);

    // get kelurahan if kecamatan change
    React.useMemo(() => {
        if (formik.values.district) {
            const { data } = responCities;
            const village = groupingSubCity(formik.values.district.label, 'village', data.getCityByRegionId.item);
            const state = { ...addressState };
            state.dropdown.village = village;
            if (city && !formik.values.village) {
                const defaultValue = splitCityValue(city);
                formik.setFieldValue('village', getCityByLabel(defaultValue[2], state.dropdown.village));
            } else {
                // reset village if district change
                formik.setFieldValue('village', '');
                formik.setFieldValue('postcode', '');
            }
            setAddressState(state);
        }
    }, [formik.values.district]);

    React.useMemo(() => {
        if (formik.values.village) {
            formik.setFieldValue('postcode', formik.values.village.postcode);
        }
    }, [formik.values.village]);

    return (
        <Content
            t={t}
            open={open}
            setOpen={setOpen}
            pageTitle={pageTitle}
            formik={formik}
            addressState={addressState}
            setFromUseEffect={setFromUseEffect}
            getCities={getCities}
            setAddressState={setAddressState}
            mapPosition={mapPosition}
            handleDragPosition={handleDragPosition}
            disableDefaultAddress={disableDefaultAddress}
            loading={loading}
            success={success}
            gmapKey={gmapKey}
        />
    );
};

export default AddressFormDialog;

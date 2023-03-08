import React, {
    useState, useEffect, useCallback, useRef,
} from 'react';

const placeHolder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAQAAADVobXoAAAAEElEQVR42mM8858BDBhhDAArAgOZPzQZFwAAAABJRU5ErkJggg==';

const LazyImage = ({ src, alt, style = {} }) => {
    const [imageSrc, setImageSrc] = useState(placeHolder);
    const [imageRef, setImageRef] = useState();
    const mount = useRef(null);

    const onLoad = useCallback((event) => {
        event.target.classList.add('loaded');
    }, []);

    const onError = useCallback((event) => {
        event.target.classList.add('has-error');
    }, []);

    useEffect(
        () => {
            mount.current = true;
            let observer;
            let didCancel = false;
            if (mount.current) {
                if (typeof window !== 'undefined' && navigator && navigator?.appVersion) {
                    const userAgent = navigator.appVersion;
                    const regex = (/iPhone|iPad|iPod|Mac/i);
                    const isIOS = regex.test(userAgent);
                    if (isIOS) {
                        const version = userAgent.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/)[0];
                        const majorVersion = version.split('_')[0];
                        // intersectionObserver not supported on IOS version 14 and below
                        if (majorVersion < 14) {
                        // Old browsers fallback
                            setImageSrc(src);
                        } else if (imageRef && imageSrc !== src) {
                            if (IntersectionObserver) {
                                observer = new IntersectionObserver(
                                    (entries) => {
                                        entries.forEach((entry) => {
                                            if (
                                                !didCancel
                                && (entry.intersectionRatio > 0 || entry.isIntersecting)
                                            ) {
                                                setImageSrc(src);
                                                observer.unobserve(imageRef);
                                            }
                                        });
                                    },
                                    {
                                        threshold: 0.01,
                                        rootMargin: '75%',
                                    },
                                );
                                observer.observe(imageRef);
                            } else {
                            // Old browsers fallback
                                setImageSrc(src);
                            }
                        }
                    }
                }
            }
            return () => {
                didCancel = true;
                // on component cleanup, we remove the listner
                if (observer && observer.unobserve) {
                    observer.unobserve(imageRef);
                }
                mount.current = false;
            };
        }, [src, imageSrc, imageRef],
    );

    return (
        <>
            <img
                style={style}
                ref={setImageRef}
                src={imageSrc}
                alt={alt}
                onLoad={onLoad}
                onError={onError}
            />
            <style jsx>
                {`
                    img {
                        display: block;
                        height: 100px;
                        width: 100px;
                    }
                    // Add a smooth animation on loading
                    @keyframes loaded {
                        0% {
                        opacity: 0.1;
                        }
                        100% {
                        opacity: 1;
                        }
                    }

                    // I use utilitary classes instead of props to avoid style regenerating
                    img.loaded:not(.has-error) {
                        animation: loaded 300ms ease-in-out;
                    }

                    img.has-error {
                        // fallback to placeholder image on error
                        content: url(/assets/img/placeholder.png);
                    }
                `}
            </style>
        </>
    );
};

export default LazyImage;

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useMapStore from '../../store/mapStore';
import { api } from '../../utils/api';
import {
  formatHistoricalYear,
  formatTodayDate,
  getUserLocalDate,
} from '../../utils/getLocalDate';
import { BANNER_CATEGORY_COLORS } from '../../utils/categoryConfig';

const DISPLAY_DURATION = 6000;

const ScrollBanner = ({ onFlyToPlace }) => {
  const { isGuest } = useMapStore();
  const [visible, setVisible] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (isGuest) return undefined;

    let isMounted = true;
    let closeTimer;
    const { month, day } = getUserLocalDate();

    api
      .get(`/api/banner/today?month=${month}&day=${day}`)
      .then((response) => {
        const bannerEvent = response?.data?.event;
        if (!isMounted || !bannerEvent) return;

        setEvent(bannerEvent);
        setVisible(true);
        closeTimer = setTimeout(() => {
          if (isMounted) setVisible(false);
        }, DISPLAY_DURATION);
      })
      .catch((error) => {
        console.error('Error fetching banner event:', error);
      });

    return () => {
      isMounted = false;
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isGuest]);

  if (isGuest || !event) return null;

  const categoryConfig =
    BANNER_CATEGORY_COLORS[event.category] || BANNER_CATEGORY_COLORS.culture;

  return (
    <div className="fixed inset-0 z-[4500] flex items-center justify-center pointer-events-none px-3">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="pointer-events-auto relative"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{
              scaleX: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            style={{ transformOrigin: 'center center' }}
          >
            <div className="relative flex items-stretch w-[90vw] max-w-[680px] min-h-[200px]">
              <div
                className="w-5 rounded-full flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(to right, #6B4F10, #C9A84C, #6B4F10)',
                  boxShadow:
                    '-2px 0 8px rgba(0,0,0,0.5), 2px 0 8px rgba(0,0,0,0.5)',
                }}
              />

              <div
                className="flex-1 px-4 py-4 md:px-8 md:py-6 relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #1C1A17 0%, #141414 50%, #1C1A17 100%)',
                  borderTop: '2px solid #2A2720',
                  borderBottom: '2px solid #2A2720',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(201,168,76,0.3) 2px,
                      rgba(201,168,76,0.3) 3px
                    )`,
                  }}
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="relative z-10"
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span
                      className="text-[10px] md:text-xs tracking-widest uppercase"
                      style={{
                        color: '#9A8F7E',
                        fontFamily: 'DM Sans, sans-serif',
                        letterSpacing: '0.15em',
                      }}
                    >
                      On This Day - {formatTodayDate()}
                    </span>

                    <span
                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full border whitespace-nowrap"
                      style={{
                        color: categoryConfig.color,
                        borderColor: `${categoryConfig.color}60`,
                        backgroundColor: `${categoryConfig.color}20`,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {categoryConfig.label}
                    </span>
                  </div>

                  <div
                    className="w-full h-px mb-4"
                    style={{
                      background: `linear-gradient(to right, transparent, ${categoryConfig.color}60, transparent)`,
                    }}
                  />

                  <p
                    className="text-sm mb-1"
                    style={{
                      color: categoryConfig.color,
                      fontFamily: 'DM Mono, monospace',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {formatHistoricalYear(event.year)}
                  </p>

                  <h2
                    className="text-xl md:text-2xl font-semibold mb-3"
                    style={{
                      color: '#F0E6D3',
                      fontFamily: 'Playfair Display, serif',
                      lineHeight: 1.3,
                    }}
                  >
                    {event.title}
                  </h2>

                  <p
                    className="text-xs md:text-sm leading-relaxed mb-5"
                    style={{
                      color: '#9A8F7E',
                      fontFamily: 'DM Sans, sans-serif',
                      lineHeight: 1.7,
                    }}
                  >
                    {event.description}
                  </p>

                  <div className="flex items-center gap-3">
                    {event.place && typeof onFlyToPlace === 'function' && (
                      <button
                        onClick={() => {
                          onFlyToPlace(event.place);
                          setVisible(false);
                        }}
                        className="text-xs px-4 py-2 rounded border transition-all duration-200"
                        style={{
                          color: categoryConfig.color,
                          borderColor: categoryConfig.color,
                          fontFamily: 'DM Sans, sans-serif',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            `${categoryConfig.color}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        View on Map -&gt;
                      </button>
                    )}

                    <div className="flex-1" />

                    <span
                      className="text-xs"
                      style={{
                        color: '#5C5347',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      Closes automatically...
                    </span>

                    <button
                      onClick={() => setVisible(false)}
                      className="text-xs px-3 py-2 rounded border transition-colors duration-200"
                      style={{
                        color: '#5C5347',
                        borderColor: '#2A2720',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#9A8F7E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#5C5347';
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-0 left-0 h-0.5"
                  style={{ backgroundColor: categoryConfig.color }}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: DISPLAY_DURATION / 1000, ease: 'linear' }}
                />
              </div>

              <div
                className="w-5 rounded-full flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(to right, #6B4F10, #C9A84C, #6B4F10)',
                  boxShadow:
                    '-2px 0 8px rgba(0,0,0,0.5), 2px 0 8px rgba(0,0,0,0.5)',
                }}
              />
            </div>

            <div
              className="absolute -bottom-4 left-8 right-8 h-4 rounded-full blur-md -z-10"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollBanner;
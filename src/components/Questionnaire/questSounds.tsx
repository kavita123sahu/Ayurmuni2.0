import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

export type QuestSoundKind = 'start' | 'select' | 'advance';

const SOURCES: Record<QuestSoundKind, any> = {
  start: require('../../assets/sounds/quest_start.wav'),
  select: require('../../assets/sounds/quest_select.wav'),
  advance: require('../../assets/sounds/quest_advance.wav'),
};

type QuestSoundContextValue = {
  muted: boolean;
  setMuted: (v: boolean) => void;
  toggleMuted: () => void;
  play: (kind: QuestSoundKind) => void;
};

const QuestSoundContext = createContext<QuestSoundContextValue | null>(null);

export const QuestSoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [muted, setMuted] = useState(false);
  const [clip, setClip] = useState<{ kind: QuestSoundKind; id: number } | null>(
    null,
  );
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const play = useCallback((kind: QuestSoundKind) => {
    if (mutedRef.current) return;
    setClip({ kind, id: Date.now() });
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted(m => !m);
  }, []);

  const value = useMemo(
    () => ({ muted, setMuted, toggleMuted, play }),
    [muted, play, toggleMuted],
  );

  return (
    <QuestSoundContext.Provider value={value}>
      {children}
      {clip ? (
        <View pointerEvents="none" style={styles.hidden}>
          <Video
            key={clip.id}
            source={SOURCES[clip.kind]}
            // audioOnly
            paused={false}
            repeat={false}
            volume={1}
            muted={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            onEnd={() => setClip(null)}
            onError={() => setClip(null)}
            style={styles.hidden}
          />
        </View>
      ) : null}
    </QuestSoundContext.Provider>
  );
};

export const useQuestSound = () => {
  const ctx = useContext(QuestSoundContext);
  if (!ctx) {
    return {
      muted: true,
      setMuted: (_v: boolean) => { },
      toggleMuted: () => { },
      play: (_kind: QuestSoundKind) => { },
    };
  }
  return ctx;
};

/** Play start jingle once when the quest screen mounts */
export const useQuestStartSound = (enabled = true) => {
  const { play } = useQuestSound();
  const played = useRef(false);

  useEffect(() => {
    if (!enabled || played.current) return;
    played.current = true;
    const t = setTimeout(() => play('start'), 220);
    return () => clearTimeout(t);
  }, [enabled, play]);
};

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
});

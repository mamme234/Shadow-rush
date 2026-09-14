import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { Navbar } from '../components/ui/Navbar';
import { audio } from '../services/audioService';

interface StoryScreenProps {
  shards: number;
  playerLevel: number;
  onBack: () => void;
  onAdminPress: () => void;
  onPlayNow: () => void;
}

interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  realm: string;
  content: string[];
  quote: string;
  speaker: string;
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'THE ECLIPSE OF MOONLIT VEIL',
    subtitle: 'PROLOGUE',
    realm: 'Moonlit Forest',
    quote: 'When the lanterns turn to emerald ash, the veil between life and abyss disintegrates.',
    speaker: 'Elder Kazuma',
    content: [
      'For three hundred years, the five sacred realms were kept in equilibrium by the Moonlit Shrines.',
      'From the deepest crevasse of the abyss came The Hollow — a corrupting darkness that consumes memories and twists guardians into thralls.',
      'Kairo, the last initiate trained in the dual shadow arts of Nox and Umbra, returns to find the Whispering Pines in silence.',
    ],
  },
  {
    id: 2,
    title: 'THE FALLEN TEMPLE GUARDIAN',
    subtitle: 'CHAPTER I',
    realm: 'Sanctuary of the Revenant',
    quote: 'You fight for memories that have already turned to dust, Kairo.',
    speaker: 'Kage-no-Oni',
    content: [
      'At the highest altar of the Moonlit Forest, the once-noble samurai Kage-no-Oni stands corrupted.',
      'His armor burns with the crimson mark of The Hollow. His twin katanas no longer defend the sacred shrine, but thirst for void essence.',
      'Only by vanquishing the Revenant can Kairo obtain the First Moon Sigil and break the seal guarding the Forgotten Temple.',
    ],
  },
  {
    id: 3,
    title: 'BEYOND THE FORGOTTEN TEMPLE',
    subtitle: 'CHAPTER II',
    realm: 'The 5 Realms',
    quote: 'Master the shadow. Do not let the shadow master you.',
    speaker: 'Kairo',
    content: [
      'Beyond the forest lie four more domains: the Sunken Relics of the Forgotten Temple, the howling abyss of Shadow Canyon, the mechanized war-engines of the Iron Fortress, and the throne room of Nightfall Castle.',
      'With each realm cleansed, Kairo gathers sacred Shadow Shards and Memory Fragments, piecing together the forgotten art of the Silent Night.',
    ],
  },
];

export const StoryScreen: React.FC<StoryScreenProps> = ({
  shards,
  playerLevel,
  onBack,
  onAdminPress,
  onPlayNow,
}) => {
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const chapter = STORY_CHAPTERS[selectedChapterIdx];

  return (
    <View style={styles.container}>
      <Navbar
        title="SHADOW CHRONICLES"
        subtitle="STORY OF KAIRO"
        onBack={onBack}
        shards={shards}
        playerLevel={playerLevel}
        onAdminPress={onAdminPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chapter Carousel Pills */}
        <View style={styles.pillsRow}>
          {STORY_CHAPTERS.map((ch, idx) => (
            <TouchableOpacity
              key={ch.id}
              style={[
                styles.pillBtn,
                idx === selectedChapterIdx && styles.pillBtnActive,
              ]}
              onPress={() => {
                audio.playButton();
                setSelectedChapterIdx(idx);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillBtnText,
                  idx === selectedChapterIdx && styles.pillBtnTextActive,
                ]}
              >
                {ch.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Story Card */}
        <View style={styles.storyCard}>
          <View style={styles.realmBadge}>
            <Ionicons name="location" size={12} color={THEME.colors.primary} />
            <Text style={styles.realmText}>{chapter.realm}</Text>
          </View>

          <Text style={styles.storyTitle}>{chapter.title}</Text>

          {/* Atmospheric Quote Box */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>"{chapter.quote}"</Text>
            <Text style={styles.quoteSpeaker}>— {chapter.speaker}</Text>
          </View>

          {/* Narrative Paragraphs */}
          <View style={styles.narrativeContainer}>
            {chapter.content.map((para, i) => (
              <Text key={i} style={styles.paragraphText}>
                {para}
              </Text>
            ))}
          </View>

          {/* Navigation Controls */}
          <View style={styles.cardNavRow}>
            <TouchableOpacity
              style={[
                styles.navBtn,
                selectedChapterIdx === 0 && styles.navBtnDisabled,
              ]}
              disabled={selectedChapterIdx === 0}
              onPress={() => {
                audio.playButton();
                setSelectedChapterIdx((prev) => Math.max(0, prev - 1));
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color={THEME.colors.white} />
              <Text style={styles.navBtnText}>PREVIOUS</Text>
            </TouchableOpacity>

            {selectedChapterIdx < STORY_CHAPTERS.length - 1 ? (
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnPrimary]}
                onPress={() => {
                  audio.playButton();
                  setSelectedChapterIdx((prev) =>
                    Math.min(STORY_CHAPTERS.length - 1, prev + 1)
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.navBtnPrimaryText}>NEXT CHAPTER</Text>
                <Ionicons name="arrow-forward" size={16} color="#05070a" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnPrimary]}
                onPress={() => {
                  audio.playButton();
                  onPlayNow();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.navBtnPrimaryText}>COMMENCE PURGE</Text>
                <Ionicons name="play" size={16} color="#05070a" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pillBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  pillBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
  },
  pillBtnText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pillBtnTextActive: {
    color: THEME.colors.primary,
  },
  storyCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  realmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  realmText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storyTitle: {
    color: THEME.colors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
  },
  quoteBox: {
    backgroundColor: THEME.colors.surfaceLight,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    marginBottom: 18,
  },
  quoteText: {
    color: THEME.colors.moonlight,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quoteSpeaker: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'right',
  },
  narrativeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  paragraphText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    lineHeight: 22,
  },
  cardNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  navBtnPrimary: {
    backgroundColor: THEME.colors.primary,
    borderColor: '#90e0ef',
  },
  navBtnPrimaryText: {
    color: '#05070a',
    fontSize: 11,
    fontWeight: '800',
  },
});

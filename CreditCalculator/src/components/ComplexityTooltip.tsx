import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Info16Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: tokens.spacingHorizontalM,
    maxWidth: '800px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  lowHeader: {
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase300,
    borderBottom: `2px solid ${tokens.colorPaletteGreenBorder1}`,
    paddingBottom: tokens.spacingVerticalXS,
  },
  mediumHeader: {
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorPaletteMarigoldForeground1,
    fontSize: tokens.fontSizeBase300,
    borderBottom: `2px solid ${tokens.colorPaletteMarigoldBorder1}`,
    paddingBottom: tokens.spacingVerticalXS,
  },
  highHeader: {
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase300,
    borderBottom: `2px solid ${tokens.colorPaletteRedBorder1}`,
    paddingBottom: tokens.spacingVerticalXS,
  },
  veryHighHeader: {
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    paddingBottom: tokens.spacingVerticalXS,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
  },
  percentile: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
    fontStyle: 'italic',
  },
});

export const ComplexityTooltip: React.FC = () => {
  const styles = useStyles();

  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<Info16Regular />}
          size="small"
          aria-label="Complexity level descriptions"
        />
      </PopoverTrigger>
      <PopoverSurface>
        <div className={styles.grid}>
          <div className={styles.column}>
            <Text className={styles.lowHeader}>Low <Text className={styles.percentile}>(5th–35th percentile)</Text></Text>
            <Text className={styles.description}>
              Small amount of work completed in a short conversation or run with minimal steps and quick completion
            </Text>
          </div>
          <div className={styles.column}>
            <Text className={styles.mediumHeader}>Medium <Text className={styles.percentile}>(35th–65th percentile)</Text></Text>
            <Text className={styles.description}>
              Moderate work in longer conversations or runs combining a few steps or inputs into a structured result
            </Text>
          </div>
          <div className={styles.column}>
            <Text className={styles.highHeader}>High <Text className={styles.percentile}>(65th–85th percentile)</Text></Text>
            <Text className={styles.description}>
              Larger work in extended conversations or runs spanning multiple steps, inputs, or systems to produce detailed results
            </Text>
          </div>
          <div className={styles.column}>
            <Text className={styles.veryHighHeader}>Very High <Text className={styles.percentile}>(85th–95th percentile)</Text></Text>
            <Text className={styles.description}>
              Most intensive work in long-running conversations or runs with many steps, large inputs, or sustained processing to produce comprehensive results
            </Text>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

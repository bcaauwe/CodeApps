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

interface ComplexityTooltipLevel {
  label: string;
  percentile?: string;
  description: string;
}

interface ComplexityTooltipData {
  low?: ComplexityTooltipLevel;
  medium?: ComplexityTooltipLevel;
  high?: ComplexityTooltipLevel;
  veryHigh?: ComplexityTooltipLevel;
}

interface ComplexityTooltipProps {
  tooltipJson?: string;
}

const LEVEL_ORDER: (keyof ComplexityTooltipData)[] = ['low', 'medium', 'high', 'veryHigh'];

const HEADER_STYLES: Record<keyof ComplexityTooltipData, { color: string; border: string }> = {
  low: { color: tokens.colorPaletteGreenForeground1, border: tokens.colorPaletteGreenBorder1 },
  medium: { color: tokens.colorPaletteMarigoldForeground1, border: tokens.colorPaletteMarigoldBorder1 },
  high: { color: tokens.colorPaletteRedForeground1, border: tokens.colorPaletteRedBorder1 },
  veryHigh: { color: tokens.colorNeutralForeground1, border: tokens.colorNeutralStroke1 },
};

const DEFAULT_TOOLTIP: ComplexityTooltipData = {
  low: {
    label: 'Low',
    percentile: '5th–35th percentile',
    description: 'Small amount of work completed in a short conversation or run with minimal steps and quick completion',
  },
  medium: {
    label: 'Medium',
    percentile: '35th–65th percentile',
    description: 'Moderate work in longer conversations or runs combining a few steps or inputs into a structured result',
  },
  high: {
    label: 'High',
    percentile: '65th–85th percentile',
    description: 'Larger work in extended conversations or runs spanning multiple steps, inputs, or systems to produce detailed results',
  },
  veryHigh: {
    label: 'Very High',
    percentile: '85th–95th percentile',
    description: 'Most intensive work in long-running conversations or runs with many steps, large inputs, or sustained processing to produce comprehensive results',
  },
};

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gap: tokens.spacingHorizontalM,
    maxWidth: '800px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
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

export const ComplexityTooltip: React.FC<ComplexityTooltipProps> = ({ tooltipJson }) => {
  const styles = useStyles();

  let data: ComplexityTooltipData = DEFAULT_TOOLTIP;
  if (tooltipJson) {
    try {
      data = JSON.parse(tooltipJson) as ComplexityTooltipData;
    } catch {
      // Fall back to default on invalid JSON
    }
  }

  const levels = LEVEL_ORDER.filter((key) => data[key]);
  const columnCount = levels.length;

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
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
        >
          {levels.map((key) => {
            const level = data[key]!;
            const headerStyle = HEADER_STYLES[key];
            return (
              <div key={key} className={styles.column}>
                <Text
                  style={{
                    fontWeight: tokens.fontWeightBold,
                    color: headerStyle.color,
                    fontSize: tokens.fontSizeBase300,
                    borderBottom: `2px solid ${headerStyle.border}`,
                    paddingBottom: tokens.spacingVerticalXS,
                  }}
                >
                  {level.label}
                  {level.percentile && (
                    <>
                      {' '}
                      <Text className={styles.percentile}>({level.percentile})</Text>
                    </>
                  )}
                </Text>
                <Text className={styles.description}>{level.description}</Text>
              </div>
            );
          })}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

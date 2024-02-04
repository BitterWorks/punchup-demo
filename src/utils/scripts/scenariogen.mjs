import { writeFileSync } from 'fs';

const args = process.argv.slice(2);

// Extract parameters from command line arguments
const featureArg = args.find((arg) => arg.startsWith('--feature='));
const scenarioArg = args.find((arg) => arg.startsWith('--scenario='));
const stepsArg = args.find((arg) => arg.startsWith('--steps='));

// Extract values from arguments
const feature = featureArg ? featureArg.split('=')[1] : null;
const scenario = scenarioArg ? scenarioArg.split('=')[1] : null;
const steps = stepsArg ? JSON.parse(stepsArg.split('=')[1]) : null;

function generateFeatureFile(feature, scenario, steps) {
  console.log('///STEPS///');
  console.log(steps);
  let featureFile = `Feature: ${feature}\n\nScenario: ${scenario}\n`;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step) {
      // Remove backslashes before quotes, excluding those within single quotes
      const formattedStep = step
        .replace(/(\\)(?=(?:[^']*'[^']*')*[^']*$)/g, '')
        // Handle apostrophe
        .replaceAll('._.', "'")
        // Hanple parentheses
        .replaceAll('.-.', '=');

      // Add extra indentation for steps after the first one
      const indentation = i === 0 ? '' : '  ';

      featureFile += `${indentation}${formattedStep}\n`;
    }
  }

  return featureFile;
}

// Generate the feature file content
const featureFileContent = generateFeatureFile(feature, scenario, steps);

console.log('///FEATURE FILE CONTENT///');
console.log(featureFileContent);

// Write the content to features/temp.feature
writeFileSync('features/temp.feature', featureFileContent);

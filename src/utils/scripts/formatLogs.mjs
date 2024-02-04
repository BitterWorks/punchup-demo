import { readFile, writeFile } from 'fs';

// Helper function to escape HTML entities
function escapeHtml(str) {
  return str.replace(/[&<"']/g, function (match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}

function removeCommentsAndAttachments(line) {
  // Remove comments starting from # and lines starting with "Attachment"
  const trimmedLine = line.split('#')[0].trim();
  const formattedLine = trimmedLine.startsWith('Attachment') ? '' : trimmedLine;
  return formattedLine;
}

function extractFailures(txtFilePath, htmlFilePath) {
  // Read the content of the .txt file
  readFile(txtFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Find the index of the "Failures:" line
    const failuresIndex = data.indexOf('Failures:');

    if (failuresIndex !== -1) {
      // Extract lines after the "Failures:" line
      const failuresContent = data.substring(failuresIndex);

      // Remove comments and lines starting with "Attachment" from each line
      const linesWithoutCommentsAndAttachments = failuresContent
        .split('\n')
        .map(removeCommentsAndAttachments)
        .filter((line) => line !== '');

      // Find the index of the line starting with a cross (✖)
      const crossIndex = linesWithoutCommentsAndAttachments.findIndex((line) =>
        line.trim().startsWith('✖')
      );

      if (crossIndex !== -1) {
        // Keep only lines before the line starting with a cross
        linesWithoutCommentsAndAttachments.splice(crossIndex + 1);
      }

      // Transform the text content into HTML
      const htmlContent = `<pre>${escapeHtml(linesWithoutCommentsAndAttachments.join('\n'))}</pre>`;

      // Write the HTML content to the new .html file
      writeFile(htmlFilePath, htmlContent, 'utf8', (err) => {
        if (err) {
          console.error('Error writing the HTML file:', err);
          return;
        }

        console.log('Extraction successful. HTML file created:', htmlFilePath);
      });
    } else {
      console.log('No failures found in the file:', txtFilePath);
    }
  });
}

// Example usage
const txtFilePath = 'logs.txt';
const htmlFilePath = 'logs.html';
extractFailures(txtFilePath, htmlFilePath);

import { jsPDF } from "jspdf"
import "svg2pdf.js"

const HanziWriter = require("hanzi-writer")

function renderFanningStrokes(startX, startY, strokes, start) {
  var group = document.createElementNS("http://www.w3.org/2000/svg", "g");

  // set the transform property on the g element so the character renders at 75x75
  var transformData = HanziWriter.getScalingTransform(75, 75);
  group.setAttributeNS(null, "transform", `translate(${startX}, ${startY}) scale(${transformData.scale}, -${transformData.scale})`);

  strokes.forEach(function(strokePath) {
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttributeNS(null, "d", strokePath);
    // style the character paths
    path.style.fill = start ? "#555" : "#DDD";
    group.appendChild(path);
  });

  return group.outerHTML;
}

// Max line is 13
function horizontalLineCharacterBackground(line) {
  var background = ""
  for (var i = 0; i < 10; i++) {
    background = background +
    `
      <line x1="${(25 + 75 * i)}" y1="${(30 + 75 * line)}" x2="${(100 + 75 * i)}" y2="${(105 + 75 * line)}" stroke="#DDD" />
      <line x1="${(100 + 75 * i)}" y1="${(30 + 75 * line)}" x2="${(25 + 75 * i)}" y2="${(105 + 75 * line)}" stroke="#DDD" />
      <line x1="${(62.5 + 75 * i)}" y1="${(30 + 75 * line)}" x2="${(62.5 + 75 * i)}" y2="${(105 + 75 * line)}" stroke="#DDD" />
      <line x1="${(25 + 75 * i)}" y1="${(67.5 + 75 * line)}" x2="${(100 + 75 * i)}" y2="${(67.5 + 75 * line)}" stroke="#DDD" />
      <line x1="${(25 + 75 * i)}" y1="${(30 + 75 * line)}" x2="${(100 + 75 * i)}" y2="${(30 + 75 * line)}" stroke="#555" />
      <line x1="${(25 + 75 * i)}" y1="${(30 + 75 * line)}" x2="${(25 + 75 * i)}" y2="${(105 + 75 * line)}" stroke="#555" />
      <line x1="${(25 + 75 * i)}" y1="${(105 + 75 * line)}" x2="${(100 + 75 * i)}" y2="${(105 + 75 * line)}" stroke="#555" />
      <line x1="${(100 + 75 * i)}" y1="${(30 + 75 * line)}" x2="${(100 + 75 * i)}" y2="${(105 + 75 * line)}" stroke="#555" />
    `
  }
  return background
}

// Max line is 9
// function verticalLineCharacterBackground(line) {
//   var background = ""
//   for (var i = 0; i < 14; i++) {
//     background = background +
//     `
//       <line x1="${700 - 75 * line}" y1="${30 + 75 * i}" x2="${775 - 75 * line}" y2="${105 + 75 * i}" stroke="#DDD" />
//       <line x1="${775 - 75 * line}" y1="${30 + 75 * i}" x2="${700 - 75 * line}" y2="${105 + 75 * i}" stroke="#DDD" />
//       <line x1="${737.5 - 75 * line}" y1="${30 + 75 * i}" x2="${737.5 - 75 * line}" y2="${105 + 75 * i}" stroke="#DDD" />
//       <line x1="${700 - 75 * line}" y1="${67.5 + 75 * i}" x2="${775 - 75 * line}" y2="${67.5 + 75 * i}" stroke="#DDD" />
//       <line x1="${700 - 75 * line}" y1="${30 + 75 * i}" x2="${775 - 75 * line}" y2="${30 + 75 * i}" stroke="#555" />
//       <line x1="${700 - 75 * line}" y1="${30 + 75 * i}" x2="${700 - 75 * line}" y2="${105 + 75 * i}" stroke="#555" />
//       <line x1="${700 - 75 * line}" y1="${105 + 75 * i}" x2="${775 - 75 * line}" y2="${105 + 75 * i}" stroke="#555" />
//       <line x1="${775 - 75 * line}" y1="${30 + 75 * i}" x2="${775 - 75 * line}" y2="${105 + 75 * i}" stroke="#555" />
//     `
//   }
//   return background
// }

export function generateWordSheet(inputs, fannings, placeholders, lines, direction) {
  var svgText = ['']
  var startX = 25 // x position of the character
  var startY = 95 // y position of the character
  var currentLine = 0 // control the current line to know to write on which page
  var usedBoxCounter = 0 // control the number of used boxes for the character to not go over the defined number of lines
  // Create the characters boxes
  for (var i = 0; i < lines.reduce((a, b) => a + b); i++) {
    if (svgText[(i / 14) >> 0] === undefined) {
      svgText[(i / 14) >> 0] = "" + horizontalLineCharacterBackground(i % 14)
    } else {
      svgText[(i / 14) >> 0] = svgText[(i / 14) >> 0] + horizontalLineCharacterBackground(i % 14)
    }
  }

  var promises = [] // used to draw character strokes
  inputs.forEach((input, index) => {
    var usedLines = 1
    promises.push(
      HanziWriter.loadCharacterData(input).then(function(charData) {
        svgText[(currentLine / 14) >> 0] = `${svgText[(currentLine / 14) >> 0]} ${renderFanningStrokes(startX, startY, charData.strokes, true)}` // first word full stroke
        startX = startX + 75
        usedBoxCounter = usedBoxCounter + 1

        /// Fannings
        var i = 1 // iterator for stroke portion, starts at one to avoid empty box
        var j = 0 // iterator for number of times of fanning help
        while (j < fannings[index]) {
          while (usedBoxCounter < 10 * lines[index] && i <= charData.strokes.length) {
            var strokesPortion = charData.strokes.slice(0, i)
            svgText[(currentLine / 14) >> 0] = `${svgText[(currentLine / 14) >> 0]} ${renderFanningStrokes(startX, startY, strokesPortion, false)}`
            startX = startX + 75
            usedBoxCounter = usedBoxCounter + 1
            i = i + 1
            if (startX === 775) {
              startX = 25
              if (startY === 1070) {
                startY = 95
              } else {
                startY = startY + 75
              }
              usedLines = usedLines + 1
              currentLine = currentLine + 1
            }
          }
          j = j + 1
          i = 1
        }

        /// Placeholders
        var k = 0 // Iterator for number of times of character placeholder help
        while (k < placeholders[index] && usedBoxCounter < 10 * lines[index]) {
          svgText[(currentLine / 14) >> 0] = `${svgText[(currentLine / 14) >> 0]} ${renderFanningStrokes(startX, startY, charData.strokes, false)}`
          startX = startX + 75
          usedBoxCounter = usedBoxCounter + 1
          k = k + 1
          if (startX === 775) {
            startX = 25
            if (startY === 1070) {
              startY = 95
            } else {
              startY = startY + 75
            }
            usedLines = usedLines + 1
            currentLine = currentLine + 1
          }
        }
      }).then(() => {
        /// Number of lines
        if (lines[index] === usedLines) {
          startY = startY + 75
        } else {
          for (var i = 0; i < lines[index] - usedLines + 1; i++) {
            if (startY === 1070) {
              startY = 95
            } else {
              startY = startY + 75
            }
          }
          //startY = startY + 75 * (lines[index] - usedLines + 1)
        }
        // if (startY > 1070) {
        //   startY = 25 + startY % 1070
        // }
        currentLine = currentLine + (lines[index] - usedLines + 1)

        startX = 25 // New character
        usedBoxCounter = 0
      })
    )
  })

  const pdf = new jsPDF("p", "pt", [793.7008056640625, 1122.519775390625])
  var pdfPromises = []
  Promise.all(promises).then(async () => {
    for (var i = 0; i < svgText.length - 1; i++) {
      await pdf.addPage()
    }
    for (var j = 0; j < svgText.length; j++) {
      var target = document.createElement(`target_${i}`);
      await pdf.setPage(j+1)
      target.innerHTML = `<svg width="210mm" height="297mm">` + svgText[j] + "</svg>"
      const svgElement = target.firstElementChild
      await pdf.svg(svgElement, { width: 793.7008056640625, height: 1122.519775390625 })
    }
  }).then(() => {
    Promise.all(pdfPromises).then(() => {
      pdf.save("practice.pdf")
    })
  })
}
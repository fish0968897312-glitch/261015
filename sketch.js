// 宣告測驗題目資料陣列
let questions = [
  // 建立第一題資料
  {
    // 設定第一題題目文字
    question: "在 p5.js 中，要繪製橢圓形應該使用哪一個函式？",
    // 設定第一題的四個選項
    options: ["rect()", "ellipse()", "line()", "triangle()"],
    // 設定第一題正確答案的索引值
    answer: 1
  },
  // 建立第二題資料
  {
    // 設定第二題題目文字
    question: "哪一個函式可以設定圖形的填滿顏色？",
    // 設定第二題的四個選項
    options: ["stroke()", "noFill()", "fill()", "background()"],
    // 設定第二題正確答案的索引值
    answer: 2
  },
  // 建立第三題資料
  {
    // 設定第三題資料
    question: "background(0) 會產生什麼效果？",
    // 設定第三題的四個選項
    options: ["白色背景", "黑色背景", "紅色背景", "透明背景"],
    // 設定第三題正確答案的索引值
    answer: 1
  },
  // 建立第四題資料
  {
    // 設定第四題題目文字
    question: "哪一個函式可以在畫布上繪製直線？",
    // 設定第四題的四個選項
    options: ["circle()", "point()", "line()", "text()"],
    // 設定第四題正確答案的索引值
    answer: 2
  },
  // 建立第五題資料
  {
    // 設定第五題題目文字
    question: "p5.js 中的 setup() 函式通常會執行幾次？",
    // 設定第五題的四個選項
    options: ["每一幀一次", "只執行一次", "滑鼠點擊時執行", "鍵盤按下時執行"],
    // 設定第五題正確答案的索引值
    answer: 1
  }
];

// 設定目前顯示的題目索引值
let currentQuestion = 0;
// 設定目前題目是否已經作答
let hasAnswered = false;
// 設定目前答案是否正確
let currentAnswerCorrect = false;
// 設定目前選取的答案索引值
let selectedAnswer = -1;
// 設定目前測驗累計答對題數
let score = 0;
// 記錄答案動畫開始時的影格編號
let animationStartFrame = 0;
// 保存畫布元素，方便設定父層與觸控樣式
let canvasElement;
// 記錄最近一次觸控時間，避免行動裝置重複觸發滑鼠事件
let lastTouchTime = -1000;
// 保存目前畫布父層元素
let canvasParent;

// p5.js 初始化函式
function setup() {
  // 動態載入 Google Fonts (Poppins 與 Noto Sans TC)
  let fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Poppins:wght@400;500;600&display=swap";
  document.head.appendChild(fontLink);

  // 將整個網頁設定為無外距、不可捲動並限制觸控預設行為
  document.documentElement.style.margin = "0";
  document.body.style.margin = "0";
  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
  
  // 建立專用畫布父層容器
  canvasParent = document.createElement("main");
  canvasParent.id = "p5-responsive-quiz-canvas";
  canvasParent.style.width = "100vw";
  canvasParent.style.height = "100vh";
  canvasParent.style.position = "fixed";
  canvasParent.style.left = "0";
  canvasParent.style.top = "0";
  canvasParent.style.touchAction = "none";
  document.body.appendChild(canvasParent);

  // 取得適合目前裝置的高 DPI 倍率
  pixelDensity(getSafePixelDensity());
  // 建立符合視窗大小的 p5.js 畫布
  canvasElement = createCanvas(getViewportWidth(), getViewportHeight());
  canvasElement.parent(canvasParent);
  canvasElement.elt.style.width = "100%";
  canvasElement.elt.style.height = "100%";
  canvasElement.elt.style.touchAction = "none";
  canvasElement.elt.style.display = "block";
  canvasElement.elt.setAttribute("aria-label", "p5.js 程式設計指令練習測驗");
  
  textAlign(CENTER, CENTER);
  noStroke();
  textSize(20);
  
  // 設定精緻的中英文字型組合
  textFont("'Poppins', 'Noto Sans TC', sans-serif");
  
  getLayout();
}

// 取得目前瀏覽器可使用的視窗寬度
function getViewportWidth() {
  return Math.max(1, Math.floor(window.innerWidth || windowWidth));
}

// 取得目前瀏覽器可使用的視窗高度
function getViewportHeight() {
  return Math.max(1, Math.floor(window.innerHeight || windowHeight));
}

// 取得限制在合理範圍內的裝置像素倍率
function getSafePixelDensity() {
  const deviceRatio = Number(window.devicePixelRatio) || 1;
  return Math.min(Math.max(deviceRatio, 1), 2);
}

// 當瀏覽器視窗大小改變時重新調整畫布
function windowResized() {
  pixelDensity(getSafePixelDensity());
  resizeCanvas(getViewportWidth(), getViewportHeight());
  getCurrentInteractionLayout();
}

// 將題目或選項文字依照實際像素寬度切成多行
function wrapTextByWidth(sourceText, maxWidth, fontSize) {
  textSize(fontSize);
  const lines = [];
  let currentLine = "";
  for (let index = 0; index < sourceText.length; index += 1) {
    const character = sourceText.charAt(index);
    if (character === "\n") {
      lines.push(currentLine);
      currentLine = "";
      continue;
    }
    const previewLine = currentLine + character;
    if (currentLine.length > 0 && textWidth(previewLine) > maxWidth) {
      lines.push(currentLine);
      currentLine = character;
    } else {
      currentLine = previewLine;
    }
  }
  if (currentLine.length > 0 || lines.length === 0) {
    lines.push(currentLine);
  }
  return lines;
}

// 將數值限制在指定的最小值與最大值之間
function clampValue(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

// 計算包含所有畫面元件與點擊區域的唯一響應式版面資料
function getLayout() {
  const canvasWidth = Math.max(1, width);
  const canvasHeight = Math.max(1, height);
  const outerMargin = clampValue(Math.min(canvasWidth * 0.05, canvasHeight * 0.035), 6, 48);
  const isLandscape = canvasWidth > canvasHeight;
  const contentWidth = Math.max(1, canvasWidth - outerMargin * 2);
  let fitScale = clampValue(Math.min(canvasWidth / 480, canvasHeight / 760), 0.35, 1.15);
  let finalLayout = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const titleSize = Math.max(8, Math.min(34, canvasWidth * 0.055, canvasHeight * 0.075) * fitScale);
    const progressSize = Math.max(7, Math.min(21, canvasWidth * 0.034, canvasHeight * 0.045) * fitScale);
    const headerTop = Math.max(3, outerMargin * 0.55);
    const titleY = headerTop + titleSize * 0.6;
    const progressY = titleY + titleSize * 0.72 + progressSize * 0.75;
    const headerGap = Math.max(3, Math.min(18, canvasHeight * 0.018) * fitScale);
    const questionTextSize = Math.max(8, Math.min(30, canvasWidth * 0.045, canvasHeight * 0.062) * fitScale);
    const questionWidth = Math.min(contentWidth, 900);
    const questionPadding = Math.max(5, Math.min(28, canvasWidth * 0.035, canvasHeight * 0.04) * fitScale);
    const questionTextWidth = Math.max(1, questionWidth - questionPadding * 2);
    const questionLines = wrapTextByWidth(questions[currentQuestion].question, questionTextWidth, questionTextSize);
    const questionLineHeight = Math.max(9, questionTextSize * 1.38);
    const questionHeight = Math.max(questionLineHeight + questionPadding * 2, questionLines.length * questionLineHeight + questionPadding * 2);
    const questionY = progressY + progressSize * 0.55 + headerGap;
    const optionTextSize = Math.max(7, Math.min(23, canvasWidth * 0.035, canvasHeight * 0.043) * fitScale);
    const optionWidth = Math.min(contentWidth, 720);
    const optionPadding = Math.max(4, Math.min(20, canvasWidth * 0.025) * fitScale);
    const optionTextWidth = Math.max(1, optionWidth - optionPadding * 2);
    const optionLineHeight = Math.max(8, optionTextSize * 1.25);
    const optionLines = [];
    let maximumOptionLines = 1;

    for (let optionIndex = 0; optionIndex < questions[currentQuestion].options.length; optionIndex += 1) {
      const optionLabel = String.fromCharCode(65 + optionIndex) + ". " + questions[currentQuestion].options[optionIndex];
      const currentLines = wrapTextByWidth(optionLabel, optionTextWidth, optionTextSize);
      optionLines.push(currentLines);
      maximumOptionLines = Math.max(maximumOptionLines, currentLines.length);
    }

    const optionHeight = Math.max(12, Math.min(64, Math.max(canvasHeight * 0.075, maximumOptionLines * optionLineHeight + optionPadding * 2)) * fitScale);
    const optionGap = Math.max(2, Math.min(20, canvasHeight * 0.019) * fitScale);
    const questionToOptionsGap = Math.max(4, Math.min(28, canvasHeight * 0.035) * fitScale);
    const firstOptionY = questionY + questionHeight + questionToOptionsGap;
    const buttonHeight = Math.max(20, Math.min(60, canvasHeight * 0.075) * fitScale);
    const buttonWidth = Math.min(optionWidth, Math.max(110, Math.min(280, canvasWidth * 0.46)) * fitScale);
    const buttonGap = Math.max(4, Math.min(24, canvasHeight * 0.03) * fitScale);
    const bottomMargin = Math.max(3, outerMargin * 0.55);
    const optionsHeight = questions[currentQuestion].options.length * optionHeight + (questions[currentQuestion].options.length - 1) * optionGap;
    const buttonAreaHeight = hasAnswered ? buttonGap + buttonHeight : 0;
    const requiredHeight = firstOptionY + optionsHeight + buttonAreaHeight + bottomMargin;
    const availableHeight = Math.max(1, canvasHeight);

    finalLayout = {
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      isLandscape: isLandscape,
      titleSize: titleSize,
      titleY: titleY,
      progressSize: progressSize,
      progressY: progressY,
      question: {
        x: (canvasWidth - questionWidth) / 2,
        y: questionY,
        width: questionWidth,
        height: questionHeight,
        padding: questionPadding,
        textSize: questionTextSize,
        lineHeight: questionLineHeight,
        lines: questionLines
      },
      options: [],
      optionLines: optionLines,
      optionTextSize: optionTextSize,
      optionLineHeight: optionLineHeight,
      optionPadding: optionPadding,
      optionWidth: optionWidth,
      optionHeight: optionHeight,
      optionGap: optionGap,
      nextButton: {
        x: (canvasWidth - buttonWidth) / 2,
        y: Math.min(canvasHeight - bottomMargin - buttonHeight, firstOptionY + optionsHeight + buttonGap),
        width: buttonWidth,
        height: buttonHeight
      },
      buttonTextSize: Math.max(8, Math.min(22, buttonHeight * 0.38)),
      bottomMargin: bottomMargin,
      scale: fitScale,
      requiredHeight: requiredHeight
    };

    if (requiredHeight <= availableHeight - 1) {
      break;
    }
    fitScale = Math.max(0.22, fitScale * Math.min(0.92, (availableHeight - bottomMargin) / Math.max(requiredHeight, 1)));
  }

  const finalQuestion = questions[currentQuestion];
  const elapsedFrames = frameCount - animationStartFrame;
  const verticalAmplitude = hasAnswered && !currentAnswerCorrect ? Math.min(finalLayout.optionGap * 0.35, finalLayout.optionHeight * 0.18) : 0;
  const horizontalAmplitude = hasAnswered && !currentAnswerCorrect ? Math.min(14 * finalLayout.scale, Math.max(0, (canvasWidth - finalLayout.optionWidth) / 2)) : 0;

  for (let optionIndex = 0; optionIndex < finalQuestion.options.length; optionIndex += 1) {
    const baseY = firstOptionYFromLayout(finalLayout, optionIndex);
    let horizontalOffset = 0;
    let verticalOffset = 0;

    if (hasAnswered && !currentAnswerCorrect && optionIndex === finalQuestion.answer) {
      verticalOffset = Math.sin(elapsedFrames * 0.18) * verticalAmplitude;
    }
    if (hasAnswered && !currentAnswerCorrect && optionIndex === selectedAnswer) {
      horizontalOffset = Math.sin(elapsedFrames * 0.22) * horizontalAmplitude;
    }

    finalLayout.options.push({
      index: optionIndex,
      x: (canvasWidth - finalLayout.optionWidth) / 2 + horizontalOffset,
      y: baseY + verticalOffset,
      width: finalLayout.optionWidth,
      height: finalLayout.optionHeight,
      horizontalOffset: horizontalOffset,
      verticalOffset: verticalOffset,
      lines: finalLayout.optionLines ? finalLayout.optionLines[optionIndex] : wrapTextByWidth(String.fromCharCode(65 + optionIndex) + ". " + finalQuestion.options[optionIndex], finalLayout.optionWidth - finalLayout.optionPadding * 2, finalLayout.optionTextSize)
    });
  }

  return finalLayout;
}

// 依照版面資料計算指定選項的原始垂直位置
function firstOptionYFromLayout(layout, optionIndex) {
  const questionToOptionsGap = Math.max(4, Math.min(28, layout.canvasHeight * 0.035) * layout.scale);
  return layout.question.y + layout.question.height + questionToOptionsGap + optionIndex * (layout.optionHeight + layout.optionGap);
}

// 繪製 p5.js 每一幀的畫面
function draw() {
  background("#f7f7f7");
  const layout = getCurrentInteractionLayout();
  
  if (currentQuestion >= questions.length) {
    drawResultScreen(layout);
    return;
  }
  
  drawTitle(layout);
  drawQuestion(layout);
  drawOptions(layout);
  
  if (hasAnswered) {
    drawNextButton(layout);
  }
}

// 繪製測驗標題與答題進度
function drawTitle(layout) {
  fill("#222222");
  textSize(layout.titleSize);
  textAlign(CENTER, CENTER);
  text("p5.js 程式設計指令練習測驗", layout.canvasWidth / 2, layout.titleY);
  
  textSize(layout.progressSize);
  text("第 " + (currentQuestion + 1) + " 題，共 " + questions.length + " 題", layout.canvasWidth / 2, layout.progressY);
}

// 繪製目前題目的紫色方框與自動換行文字
function drawQuestion(layout) {
  fill("#bdb2ff");
  rect(layout.question.x, layout.question.y, layout.question.width, layout.question.height, Math.min(14, layout.question.height * 0.18));
  
  fill("#222222");
  textSize(layout.question.textSize);
  textAlign(CENTER, CENTER);
  
  const centerX = layout.question.x + layout.question.width / 2;
  const centerY = layout.question.y + layout.question.height / 2;
  
  for (let lineIndex = 0; lineIndex < layout.question.lines.length; lineIndex += 1) {
    const lineY = centerY + (lineIndex - (layout.question.lines.length - 1) / 2) * layout.question.lineHeight;
    text(layout.question.lines[lineIndex], centerX, lineY);
  }
}

// 繪製四個選項並套用答題動畫
function drawOptions(layout) {
  const question = questions[currentQuestion];
  textSize(layout.optionTextSize);
  textAlign(CENTER, CENTER);
  
  for (let optionIndex = 0; optionIndex < layout.options.length; optionIndex += 1) {
    const option = layout.options[optionIndex];
    setOptionColor(optionIndex);
    rect(option.x, option.y, option.width, option.height, Math.min(14, option.height * 0.22));
    
    fill("#222222");
    const lines = option.lines || [String.fromCharCode(65 + optionIndex) + ". " + question.options[optionIndex]];
    const textCenterY = option.y + option.height / 2;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const lineY = textCenterY + (lineIndex - (lines.length - 1) / 2) * layout.optionLineHeight;
      text(lines[lineIndex], option.x + option.width / 2, lineY);
    }
  }
}

// 依照目前作答狀態設定選項顏色
function setOptionColor(optionIndex) {
  if (!hasAnswered) {
    fill("#e8e8e8");
    return;
  }
  const question = questions[currentQuestion];
  if (currentAnswerCorrect) {
    if (optionIndex === question.answer) {
      fill("#b6f2b6");
    } else {
      fill("#e8e8e8");
    }
    return;
  }
  if (optionIndex === question.answer) {
    fill("#fdffb6");
    return;
  }
  if (optionIndex === selectedAnswer) {
    fill("#ff4d6d");
    return;
  }
  fill("#e8e8e8");
}

// 繪製作答後的下一題或查看結果按鈕
function drawNextButton(layout) {
  fill("#4d96ff");
  rect(layout.nextButton.x, layout.nextButton.y, layout.nextButton.width, layout.nextButton.height, Math.min(14, layout.nextButton.height * 0.22));
  
  fill("#ffffff");
  textSize(layout.buttonTextSize);
  textAlign(CENTER, CENTER);
  
  const buttonLabel = currentQuestion === questions.length - 1 ? "查看結果" : "下一題";
  text(buttonLabel, layout.nextButton.x + layout.nextButton.width / 2, layout.nextButton.y + layout.nextButton.height / 2);
}

// 計算並繪製測驗結果畫面
function drawResultScreen(layout) {
  fill("#222222");
  textSize(layout.resultTitleSize);
  textAlign(CENTER, CENTER);
  text("測驗結束！", layout.canvasWidth / 2, layout.resultTitleY);
  
  textSize(layout.resultScoreSize);
  text("你答對了 " + score + " / " + questions.length + " 題", layout.canvasWidth / 2, layout.resultScoreY);
  
  fill("#4d96ff");
  rect(layout.restartButton.x, layout.restartButton.y, layout.restartButton.width, layout.restartButton.height, Math.min(14, layout.restartButton.height * 0.22));
  
  fill("#ffffff");
  textSize(layout.resultButtonTextSize);
  text("重新開始", layout.restartButton.x + layout.restartButton.width / 2, layout.restartButton.y + layout.restartButton.height / 2);
}

// 建立測驗結果頁面所使用的響應式版面資料
function getResultLayout() {
  const canvasWidth = Math.max(1, width);
  const canvasHeight = Math.max(1, height);
  const buttonWidth = Math.min(Math.max(120, canvasWidth * 0.46), 280);
  const buttonHeight = clampValue(Math.min(canvasHeight * 0.09, 60), 24, 60);
  
  return {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    resultTitleSize: clampValue(Math.min(canvasWidth * 0.08, canvasHeight * 0.12), 12, 48),
    resultTitleY: canvasHeight * 0.29,
    resultScoreSize: clampValue(Math.min(canvasWidth * 0.06, canvasHeight * 0.08), 10, 36),
    resultScoreY: canvasHeight * 0.43,
    restartButton: {
      x: (canvasWidth - buttonWidth) / 2,
      y: Math.min(canvasHeight * 0.62, canvasHeight - buttonHeight - 8),
      width: buttonWidth,
      height: buttonHeight
    },
    resultButtonTextSize: clampValue(buttonHeight * 0.38, 9, 22)
  };
}

// 取得目前畫面應使用的版面資料
function getCurrentInteractionLayout() {
  if (currentQuestion >= questions.length) {
    return getResultLayout();
  }
  return getLayout();
}

// 處理滑鼠按下事件
function mousePressed() {
  if (millis() - lastTouchTime < 500) {
    return false;
  }
  handleInput(mouseX, mouseY);
  return false;
}

// 處理觸控開始事件
function touchStarted() {
  lastTouchTime = millis();
  handleInput(mouseX, mouseY);
  return false;
}

// 判斷座標是否位於指定矩形內
function isPointInsideRectangle(inputX, inputY, rectangle) {
  return inputX >= rectangle.x && inputX <= rectangle.x + rectangle.width && inputY >= rectangle.y && inputY <= rectangle.y + rectangle.height;
}

// 統一處理滑鼠與觸控的點擊輸入
function handleInput(inputX, inputY) {
  const layout = getCurrentInteractionLayout();
  
  if (currentQuestion >= questions.length) {
    if (isPointInsideRectangle(inputX, inputY, layout.restartButton)) {
      currentQuestion = 0;
      score = 0;
      hasAnswered = false;
      currentAnswerCorrect = false;
      selectedAnswer = -1;
      animationStartFrame = frameCount;
    }
    return;
  }
  
  if (hasAnswered) {
    if (isPointInsideRectangle(inputX, inputY, layout.nextButton)) {
      currentQuestion += 1;
      hasAnswered = false;
      currentAnswerCorrect = false;
      selectedAnswer = -1;
      animationStartFrame = frameCount;
    }
    return;
  }
  
  for (let optionIndex = 0; optionIndex < layout.options.length; optionIndex += 1) {
    const option = layout.options[optionIndex];
    if (isPointInsideRectangle(inputX, inputY, option)) {
      selectedAnswer = optionIndex;
      hasAnswered = true;
      animationStartFrame = frameCount;
      currentAnswerCorrect = optionIndex === questions[currentQuestion].answer;
      if (currentAnswerCorrect) {
        score += 1;
      }
      break;
    }
  }
}
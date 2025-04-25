// グローバル変数としてanswersを定義
let answers = {
  carrier: null,
  wifi: null,
  price: null,
  dataUsage: null,
  members: null,
  satisfaction: null,
  needs: []
};

// 診断タイプを保持する変数をグローバルスコープで定義
let diagnosisType = '';

// 質問の定義
const questions = {
  carrier: {
    title: '現在のキャリアを教えてください',
    type: 'choice',
    choices: ['ドコモ', 'au', 'ソフトバンク', 'ワイモバイル']
  },
  wifi: {
    title: 'ネット回線をお持ちですか？',
    type: 'choice',
    choices: ['光回線', 'ケーブルテレビ', 'その他', 'なし']
  },
  price: {
    title: '現在の料金プランを教えてください',
    type: 'number',
    placeholder: '月額料金（円）'
  },
  dataUsage: {
    title: '月間の使用データ量を教えてください',
    type: 'choice',
    choices: ['0～1GB', '1～4GB', '4～10GB', '10～30GB', '30～50GB', '50GB以上']
  },
  members: {
    title: '家族の人数を教えてください',
    type: 'number',
    placeholder: '家族人数（1～10人）'
  },
  satisfaction: {
    title: '現在の料金プランに満足していますか？',
    type: 'choice',
    choices: ['とても満足', '満足', '普通', '不満', 'とても不満']
  }
};

// 質問画面を表示する関数
function showQuestion(questionId) {
  const question = questions[questionId];
  const container = document.querySelector('.container');
  
  // 既存の質問画面を非表示
  document.querySelectorAll('.question-screen').forEach(screen => {
    screen.style.display = 'none';
  });
  
  let questionElement;
  
  switch (question.type) {
    case 'choice':
      questionElement = createChoiceQuestion(
        question.title,
        question.choices,
        value => setAnswer(questionId, value)
      );
      break;
      
    case 'number':
      questionElement = createNumberInputQuestion(
        question.title,
        question.placeholder,
        value => setAnswer(questionId, value)
      );
      break;
      
    case 'multi-choice':
      questionElement = createMultiChoiceQuestion(
        question.title,
        question.choices,
        value => setAnswer(questionId, value)
      );
      break;
  }
  
  container.appendChild(questionElement);
  questionElement.style.display = 'block';
}

// 1分診断を開始する関数
function startQuickDiagnosis() {
  // 診断タイプを設定
  diagnosisType = 'quick';
  
  // すべての画面を非表示にする
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  
  // 質問画面をすべて非表示にする
  for (let i = 1; i <= 11; i++) {
    document.getElementById(`step${i}`).style.display = 'none';
  }
  
  // 1問目の質問のみを表示
  document.getElementById('step1').style.display = 'block';
  
  // 回答をリセット
  answers = {
    carrier: '',
    wifi: '',
    price: '',
    dataUsage: '',
    members: '',
    satisfaction: '',
    needs: []
  };
}

// 3分診断を開始する関数
function startDetailedDiagnosis() {
  // 診断タイプを設定
  diagnosisType = 'detailed';
  
  // すべての画面を非表示にする
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  
  // 質問画面をすべて非表示にする
  for (let i = 1; i <= 11; i++) {
    document.getElementById(`step${i}`).style.display = 'none';
  }
  
  // 1問目の質問のみを表示
  document.getElementById('step1').style.display = 'block';
  
  // 回答をリセット
  answers = {
    carrier: '',
    wifi: '',
    price: '',
    dataUsage: '',
    members: '',
    satisfaction: '',
    callTime: '',
    location: '',
    apps: [],
    contract: '',
    payment: '',
    needs: []
  };
}

// 次のステップに進む関数
function nextStep() {
  let currentStep = getCurrentStep();
  
  // 1分診断の場合は6まで、3分診断の場合は11まで
  const maxStep = diagnosisType === 'quick' ? 6 : 11;
  
  // 現在のステップを非表示
  document.getElementById(`step${currentStep}`).style.display = 'none';
  
  // 次のステップを表示
  if (currentStep < maxStep) {
    document.getElementById(`step${currentStep + 1}`).style.display = 'block';
    // 質問6に到達した場合はボタンの表示を更新
    if (currentStep + 1 === 6) {
      updateStep6Buttons();
    }
  }
}

// 前のステップに戻る関数
function goBack(step) {
  document.querySelectorAll('.container > div').forEach(div => div.style.display = 'none');
  const stepId = `step${step}`;
  document.getElementById(stepId).style.display = 'block';
  
  // ステップ6に戻った場合、ボタンの表示を更新
  if (step === 6) {
    updateStep6Buttons();
  }
}

// 回答を設定する関数
function setAnswer(key, value) {
  answers[key] = value;
  
  // 回答を保存
  saveAnswers(answers);
  
  // 最後のステップでない場合は次のステップへ
  const currentStep = getCurrentStep();
  if (currentStep < 11 || diagnosisType === 'quick') {
    nextStep();
  } else if (currentStep === 11 && diagnosisType === 'detailed') {
    // 3分診断の最後のステップの場合は結果表示
    calculateDetailedResult();
  }
}

// 満足度を設定する関数
function setSatisfaction(btn, value) {
  // 他のボタンの選択を解除
  btn.parentElement.querySelectorAll('button').forEach(button => {
    button.style.background = DEFAULT_BUTTON_COLOR;
  });
  
  // 選択したボタンをハイライト
  btn.style.background = SELECTED_BUTTON_COLOR;
  
  // 満足度を保存
  answers.satisfaction = value;
  
  // 診断タイプに応じてボタンの表示を更新
  const resultButton = document.querySelector('#step6 .cta-button');
  const nextButton = document.querySelector('#step6 .next-button');
  
  if (diagnosisType === 'quick') {
    // 1分診断の場合
    resultButton.style.display = 'block';
    if (nextButton) nextButton.style.display = 'none';
  } else {
    // 3分診断の場合
    resultButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'block';
  }
}

// ステップ6のボタン表示を更新する関数
function updateStep6Buttons() {
  const resultButton = document.querySelector('#step6 .cta-button');
  const nextButton = document.querySelector('#step6 .next-button');
  
  if (diagnosisType === 'quick') {
    // 1分診断の場合
    resultButton.style.display = 'block';
    if (nextButton) nextButton.style.display = 'none';
  } else {
    // 3分診断の場合
    resultButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'block';
  }
}

// アプリの選択を切り替える関数
function toggleApp(btn, value) {
  if (!answers.apps) {
    answers.apps = [];
  }

  if (value === '特になし') {
    // 「特になし」が選択された場合
    answers.apps = ['特になし'];
    // すべてのボタンの背景色をリセット
    btn.parentElement.querySelectorAll('button').forEach(button => {
      button.style.background = DEFAULT_BUTTON_COLOR;
    });
    btn.style.background = SELECTED_BUTTON_COLOR;
  } else {
    // その他のアプリが選択された場合
    // 「特になし」を選択リストから削除
    answers.apps = answers.apps.filter(v => v !== '特になし');
    // 「特になし」ボタンの背景色をリセット
    const noneButton = btn.parentElement.querySelector('button:last-child');
    noneButton.style.background = DEFAULT_BUTTON_COLOR;
    
    if (answers.apps.includes(value)) {
      // 選択解除
      answers.apps = answers.apps.filter(v => v !== value);
      btn.style.background = DEFAULT_BUTTON_COLOR;
    } else {
      // 選択
      answers.apps.push(value);
      btn.style.background = SELECTED_BUTTON_COLOR;
    }
  }
}

// 要望を切り替える関数
function toggleNeed(btn, value) {
  if (value === '特になし') {
    // 「特になし」が選択された場合
    answers.needs = ['特になし'];
    // すべてのボタンの背景色をリセット
    btn.parentElement.querySelectorAll('button').forEach(button => {
      button.style.background = DEFAULT_BUTTON_COLOR;
    });
    btn.style.background = SELECTED_BUTTON_COLOR;
  } else {
    // その他の要望が選択された場合
    answers.needs = answers.needs.filter(v => v !== '特になし');
    const noneButton = btn.parentElement.querySelector('button:last-child');
    resetButtonStyle(noneButton);
    
    if (answers.needs.includes(value)) {
      answers.needs = answers.needs.filter(v => v !== value);
      resetButtonStyle(btn);
    } else {
      answers.needs.push(value);
      setSelectedStyle(btn);
    }
  }

  // 診断タイプに応じてボタンの表示を更新
  updateStep6Buttons();
}

// 1分診断の結果計算
function calculateResult() {
  const { carrier, wifi, price, members, dataUsage, satisfaction } = answers;

  // 現在の支払額は入力された価格をそのまま使用
  const currentPrice = price;
  
  // 使用ギガ数に応じた推奨プランと最安値を設定
  let recommendedPlans = []; // 推奨プランを配列で管理

  if (dataUsage === '0～1GB' || dataUsage === '1～4GB') {
    recommendedPlans.push({
      data: '4GB/月',
      price: '1,078～2,365円/月',
      minPrice: 1078
    });
  } else if (dataUsage === '4～10GB') {
    recommendedPlans.push({
      data: '30GB/月',
      price: '2,178～4,015円/月',
      minPrice: 2178
    });
  } else if (dataUsage === '10～30GB') {
    // 10～30GBの場合は2つのプランを提案
    recommendedPlans.push({
      data: '35GB/月',
      price: '3,278～5,115円/月',
      minPrice: 3278
    });
    recommendedPlans.push({
      data: '30GB/月',
      price: '2,178～4,015円/月',
      minPrice: 2178
    });
    
    // 最低料金で昇順ソート
    recommendedPlans.sort((a, b) => a.minPrice - b.minPrice);
  } else if (dataUsage === '30～50GB' || dataUsage === '50GB以上') {
    recommendedPlans.push({
      data: 'ギガ無制限',
      price: '4,928～7,425円/月',
      minPrice: 4928
    });
  }

  // 結果表示
  displayResults(recommendedPlans);
}

// 3分診断の結果計算
function calculateDetailedResult() {
  const { carrier, wifi, price, members, dataUsage, callTime, location, apps, contract, payment } = answers;

  // 既存の計算ロジックを拡張
  let recommendedPlans = [];
  
  // 通話時間による追加判定
  const isHighCallUsage = callTime === '30分以上' || callTime === '15～30分';
  
  // アプリ使用による追加判定
  const isHighDataApp = apps && (apps.includes('YouTube') || apps.includes('TikTok') || apps.includes('オンラインゲーム'));
  
  // 契約期間による追加判定
  const isLongContract = contract === '3年以上' || contract === '2～3年';

  // 既存の推奨プラン判定ロジックに加えて、詳細な条件を追加
  if (dataUsage === '0～1GB' || dataUsage === '1～4GB') {
    // 低データ使用量の場合の処理
    recommendedPlans.push({
      data: '4GB/月',
      price: '1,078～2,365円/月',
      minPrice: 1078
    });
  }
  // ... 他のプラン判定ロジック ...

  // 追加情報の表示
  const additionalInfo = [];
  if (isHighCallUsage) {
    additionalInfo.push('通話オプションの追加がおすすめです');
  }
  if (isHighDataApp) {
    additionalInfo.push('動画・ゲーム使用が多いため、大容量プランをおすすめします');
  }
  if (isLongContract) {
    additionalInfo.push('長期契約特典が適用される可能性があります');
  }

  // 結果表示
  displayResults(recommendedPlans, additionalInfo);
}

// 結果表示関数
function displayResults(recommendedPlans, additionalInfo = []) {
  // 既存の結果表示ロジック
  const { carrier, wifi, price, members, dataUsage, satisfaction, callTime, location, apps, contract, payment } = answers;
  const currentPrice = price;
  const lowestPrice = Math.min(...recommendedPlans.map(plan => plan.minPrice));
  const monthlySavings = Math.max(0, currentPrice - lowestPrice);
  const annualSavings = monthlySavings * 12;
  const formattedSavings = annualSavings.toLocaleString();
  const savingsAmountSpan = `<span style="font-size: 1.4em; font-weight: bold; color: #e60012;">${formattedSavings}</span>`;
  const savingsText = annualSavings > 10000 
    ? `年間で${savingsAmountSpan}円も安くなる可能性があります！`
    : `年間で${savingsAmountSpan}円安くなる可能性があります！`;

  document.getElementById('resultText').innerHTML = savingsText;
  const isCashbackEligible = carrier !== 'ソフトバンク' && carrier !== 'ワイモバイル';
  document.getElementById('cashbackText').innerHTML = isCashbackEligible ? 
    '<span style="color: #ff0000; font-weight: bold;">キャッシュバック対象のお客様です！スタッフにお尋ねください！</span>' : 
    '';

  document.querySelectorAll('.container > div:not(#result)').forEach(div => div.style.display = 'none');
  document.getElementById('result').style.display = 'block';
  document.getElementById('historyMenu').classList.remove('show');
  document.getElementById('carrierAnswer').innerHTML = `現在のキャリア: ${carrier}`;
  document.getElementById('wifiAnswer').innerHTML = `ネット回線: ${wifi}`;
  document.getElementById('priceAnswer').innerHTML = `現在の料金プラン: ${price}円/月`;
  document.getElementById('dataUsageAnswer').innerHTML = `使用データ量: ${dataUsage}`;
  document.getElementById('membersAnswer').innerHTML = `家族人数: ${members}人`;
  document.getElementById('satisfactionAnswer').innerHTML = `満足度: ${satisfaction}%`;
  
  // 1分診断の場合は質問7以降の回答を非表示にする
  if (diagnosisType === 'quick') {
    document.getElementById('callTimeAnswer').style.display = 'none';
    document.getElementById('locationAnswer').style.display = 'none';
    document.getElementById('appsAnswer').style.display = 'none';
    document.getElementById('contractAnswer').style.display = 'none';
    document.getElementById('paymentAnswer').style.display = 'none';
  } else {
    // 3分診断の場合は全ての回答を表示
    document.getElementById('callTimeAnswer').style.display = 'block';
    document.getElementById('locationAnswer').style.display = 'block';
    document.getElementById('appsAnswer').style.display = 'block';
    document.getElementById('contractAnswer').style.display = 'block';
    document.getElementById('paymentAnswer').style.display = 'block';
    
    // 3分診断の場合は質問7以降の回答内容を設定
    document.getElementById('callTimeAnswer').innerHTML = `1日の平均通話時間: ${callTime}`;
    document.getElementById('locationAnswer').innerHTML = `主な利用場所: ${location}`;
    document.getElementById('appsAnswer').innerHTML = `よく使うアプリ: ${apps ? apps.join(', ') : '特になし'}`;
    document.getElementById('contractAnswer').innerHTML = `契約期間: ${contract}`;
    document.getElementById('paymentAnswer').innerHTML = `端末の支払い方法: ${payment}`;
  }
  
  let planHtml = '';
  recommendedPlans.forEach((plan, index) => {
    const planTitle = recommendedPlans.length > 1 ? `おすすめプラン${index + 1}` : '';
    planHtml += `
      <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; ${index > 0 ? 'margin-top: 15px;' : ''}">
        ${planTitle ? `<p style="font-weight: bold; margin-bottom: 5px;">${planTitle}</p>` : ''}
        <p style="margin: 0;">データ容量: ${plan.data}</p>
        <p style="margin: 0;">月額料金: ${plan.price}</p>
      </div>
    `;
  });

  document.getElementById('planRecommendation').innerHTML = planHtml;
  saveToHistory();
  
  // 追加情報の表示
  if (additionalInfo.length > 0) {
    const additionalHtml = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
        <h3 style="margin-bottom: 10px;">追加アドバイス</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${additionalInfo.map(info => `<li>${info}</li>`).join('')}
        </ul>
      </div>
    `;
    document.getElementById('planRecommendation').insertAdjacentHTML('beforeend', additionalHtml);
  }
}

// TOPに戻る関数
function goToTop() {
  // すべての選択をリセット
  answers = {};
  diagnosisType = '';
  
  // 保存されたデータをクリア
  clearData(STORAGE_KEYS.ANSWERS);
  
  // すべてのボタンの背景色をリセット
  document.querySelectorAll('.input-box button').forEach(button => {
    button.style.background = '#4a90e2';
  });
  
  // すべての画面を非表示にし、スタート画面のみ表示
  document.querySelectorAll('.container > div').forEach(div => {
    div.style.display = 'none';
  });
  document.getElementById('startScreen').style.display = 'block';
  
  // 履歴メニューを閉じる
  document.getElementById('historyMenu').classList.remove('show');
  
  // 結果画面を非表示
  document.getElementById('result').style.display = 'none';
}

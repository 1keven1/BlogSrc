// 获取所有标签和内容
let tabs = [];
let panels = [];

const tabContainer = document.querySelector('.tabs');
const panelContainer = document.querySelector('.panels');

const tabNames = ['Tab1', '标签2', '2333333', '阿巴阿巴阿巴阿巴'];
const tabContent = ['Tab1Tab1Tab1Tab1Tab1Tab1Tab1Tab1Tab1Tab1',
    '标签2标签2标签2标签2标签2标签2标签2标签2标签2标签2标签2',
    '233333333333333333333333333333333333333333333333333333',
    '阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴'];
let choise = -1;

// 生成标签和内容
tabNames.forEach((tabName, index, arr) => {
    let tab = document.createElement('div');
    tab.textContent = tabName;
    tab.classList.add('tab');
    tabContainer.appendChild(tab);
    tabs.push(tab);

    let panel = document.createElement('div');
    panel.textContent = tabContent[index];
    panel.classList.add('panel');
    panelContainer.appendChild(panel);
    panels.push(panel);
})

// 绑定标签点击事件
tabs.forEach((tab, index, arr) => {
    tab.index = index;
    tab.addEventListener('click', () => {
        tabClick(tab);
    })
})

// 实现标签点击事件
let tabClick = function (tab) {
    if (tab.index === choise) return;

    // 取消选择现在的标签
    if (choise >= 0) {
        panels[choise].classList.remove('enable');
        tabs[choise].classList.remove('enable');
    }
    // 选择标签
    panels[tab.index].classList.add('enable');
    tab.classList.add('enable');
    choise = tab.index;
}

// 默认选择第一个标签
tabClick(tabs[0]);

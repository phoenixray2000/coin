class PocketMoneyManager{constructor(){this.baseAmount=this.loadBaseAmount();this.startDate=this.loadStartDate();this.giveRecords=this.loadGiveRecords();this.spendRecords=this.loadSpendRecords();this.currentPage=1;this.itemsPerPage=6;this.monthStatsPage=1;this.monthStatsPerPage=6;this.currentLevel=1;this.previousLevel=1;this.pendingDeleteId=null;this.init();}
init(){this.bindEvents();this.setDefaultDates();this.updateDisplay();this.updateGiveStats();this.updateLevelDisplay();this.updateMonthStats();this.setupAutoBackup();this.performAutoGiveOnLoad();}
performAutoGiveOnLoad(){if(!this.startDate){return;}
setTimeout(()=>{const newRecords=this.generateGiveRecords({startDate:this.startDate,clearExisting:false,source:'auto'});if(newRecords.length>0){this.updateDisplay();this.updateGiveStats();this.updateLevelDisplay();if(newRecords.some(record=>{const recordDate=new Date(record.date);const today=new Date();today.setHours(0,0,0,0);return recordDate<=today;})){this.showMessage(`自动发放完成，新增 ${newRecords.length} 条记录`);}}},500);}
setupAutoBackup(){const today=new Date().toISOString().split('T')[0];const lastBackupKey='pocketMoneyLastBackupDate';const lastBackup=localStorage.getItem(lastBackupKey);if(lastBackup!==today){this.saveBackup();localStorage.setItem(lastBackupKey,today);}
const originalSaveGiveRecords=this.saveGiveRecords.bind(this);const originalSaveSpendRecords=this.saveSpendRecords.bind(this);const originalSaveStartDate=this.saveStartDate.bind(this);this.saveGiveRecords=()=>{originalSaveGiveRecords();this.saveBackup();};this.saveSpendRecords=()=>{originalSaveSpendRecords();this.saveBackup();};this.saveStartDate=(date)=>{originalSaveStartDate(date);this.saveBackup();};}
loadBaseAmount(){const saved=localStorage.getItem('pocketMoneyBaseAmount');return saved?parseFloat(saved):6;}
loadStartDate(){const saved=localStorage.getItem('pocketMoneyStartDate');return saved?saved:null;}
saveStartDate(date){localStorage.setItem('pocketMoneyStartDate',date);this.startDate=date;}
loadGiveRecords(){const saved=localStorage.getItem('pocketMoneyGiveRecords');return saved?JSON.parse(saved):[];}
loadSpendRecords(){const saved=localStorage.getItem('pocketMoneySpendRecords');return saved?JSON.parse(saved):[];}
saveGiveRecords(){localStorage.setItem('pocketMoneyGiveRecords',JSON.stringify(this.giveRecords));}
saveSpendRecords(){localStorage.setItem('pocketMoneySpendRecords',JSON.stringify(this.spendRecords));}
setDefaultDates(){const today=new Date().toISOString().split('T')[0];document.getElementById('spendDate').value=today;if(this.startDate){document.getElementById('startDate').value=this.startDate;}}
bindEvents(){const statsTab=document.getElementById('statsTab');const historyTab=document.getElementById('historyTab');const spendTab=document.getElementById('spendTab');const autoTab=document.getElementById('autoTab');const dataTab=document.getElementById('dataTab');const statsSection=document.getElementById('statsSection');const historySection=document.getElementById('historySection');const spendSection=document.getElementById('spendSection');const autoSection=document.getElementById('autoSection');const dataSection=document.getElementById('dataSection');const generateButton=document.getElementById('generateButton');const saveSpendButton=document.getElementById('saveSpendButton');const historyFilter=document.getElementById('historyFilter');const prevPage=document.getElementById('prevPage');const nextPage=document.getElementById('nextPage');const monthStatsPrevPage=document.getElementById('monthStatsPrevPage');const monthStatsNextPage=document.getElementById('monthStatsNextPage');const generateBackupButton=document.getElementById('generateBackupButton');const restoreDataButton=document.getElementById('restoreDataButton');const restoreDataText=document.getElementById('restoreDataText');const baseAmountInput=document.getElementById('baseAmount');statsTab.addEventListener('click',()=>{statsTab.classList.add('active');historyTab.classList.remove('active');spendTab.classList.remove('active');autoTab.classList.remove('active');dataTab.classList.remove('active');statsSection.classList.remove('hidden');historySection.classList.add('hidden');spendSection.classList.add('hidden');autoSection.classList.add('hidden');dataSection.classList.add('hidden');this.updateMonthStats();});historyTab.addEventListener('click',()=>{historyTab.classList.add('active');statsTab.classList.remove('active');spendTab.classList.remove('active');autoTab.classList.remove('active');dataTab.classList.remove('active');historySection.classList.remove('hidden');statsSection.classList.add('hidden');spendSection.classList.add('hidden');autoSection.classList.add('hidden');dataSection.classList.add('hidden');this.updateHistory('all');this.updateNextWeekAmount();});spendTab.addEventListener('click',()=>{spendTab.classList.add('active');statsTab.classList.remove('active');historyTab.classList.remove('active');autoTab.classList.remove('active');dataTab.classList.remove('active');spendSection.classList.remove('hidden');statsSection.classList.add('hidden');historySection.classList.add('hidden');autoSection.classList.add('hidden');dataSection.classList.add('hidden');});autoTab.addEventListener('click',()=>{autoTab.classList.add('active');statsTab.classList.remove('active');historyTab.classList.remove('active');spendTab.classList.remove('active');dataTab.classList.remove('active');autoSection.classList.remove('hidden');statsSection.classList.add('hidden');historySection.classList.add('hidden');spendSection.classList.add('hidden');dataSection.classList.add('hidden');});dataTab.addEventListener('click',()=>{dataTab.classList.add('active');statsTab.classList.remove('active');historyTab.classList.remove('active');spendTab.classList.remove('active');autoTab.classList.remove('active');dataSection.classList.remove('hidden');statsSection.classList.add('hidden');historySection.classList.add('hidden');spendSection.classList.add('hidden');autoSection.classList.add('hidden');this.updateBackupList();});generateButton.addEventListener('click',()=>{this.handleGenerateRecords();});saveSpendButton.addEventListener('click',()=>{this.saveSpendRecord();});historyFilter.addEventListener('change',(e)=>{this.currentPage=1;this.updateHistory(e.target.value);});prevPage.addEventListener('click',()=>{if(this.currentPage>1){this.currentPage--;this.updateHistory(historyFilter.value);}});nextPage.addEventListener('click',()=>{this.currentPage++;this.updateHistory(historyFilter.value);});monthStatsPrevPage.addEventListener('click',()=>{if(this.monthStatsPage>1&&monthStatsPrevPage){this.monthStatsPage--;this.updateMonthStats();}});monthStatsNextPage.addEventListener('click',()=>{if(monthStatsNextPage){this.monthStatsPage++;this.updateMonthStats();}});generateBackupButton.addEventListener('click',()=>{this.generateTextBackup();});restoreDataButton.addEventListener('click',()=>{this.restoreFromText();});const levelText=document.getElementById('levelText');levelText.addEventListener('click',()=>{this.showLevelModal();});const levelModalClose=document.getElementById('levelModalClose');const levelModal=document.getElementById('levelModal');levelModalClose.addEventListener('click',(e)=>{e.stopPropagation();this.closeLevelModal();});levelModal.addEventListener('click',(e)=>{if(e.target===levelModal){this.closeLevelModal();}});document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&levelModal.classList.contains('show')){this.closeLevelModal();}});baseAmountInput.addEventListener('input',(e)=>{this.handleBaseAmountChange(e.target.value);});this.updateBaseAmountDisplay();}
handleBaseAmountChange(value){const newBaseAmount=parseFloat(value);if(isNaN(newBaseAmount)||newBaseAmount<1||newBaseAmount>100){this.showMessage('请输入有效的初始发放金额（1-100元）');return;}
if(newBaseAmount!==this.baseAmount){this.baseAmount=newBaseAmount;this.saveBaseAmount();this.updateRuleDescription();this.showMessage(`初始发放金额已更新为 ¥${newBaseAmount}`);}}
saveBaseAmount(){localStorage.setItem('pocketMoneyBaseAmount',this.baseAmount.toString());}
updateBaseAmountDisplay(){const baseAmountInput=document.getElementById('baseAmount');if(baseAmountInput){baseAmountInput.value=this.baseAmount;}
this.updateRuleDescription();}
updateRuleDescription(){const ruleFirstThreshold=document.getElementById('ruleFirstThreshold');const ruleFirstAmount=document.getElementById('ruleFirstAmount');const ruleSecondThreshold=document.getElementById('ruleSecondThreshold');const ruleSecondAmount=document.getElementById('ruleSecondAmount');const ruleThirdThreshold=document.getElementById('ruleThirdThreshold');const ruleThirdAmount=document.getElementById('ruleThirdAmount');if(ruleFirstThreshold)ruleFirstThreshold.textContent=this.baseAmount;if(ruleFirstAmount)ruleFirstAmount.textContent=this.baseAmount;if(ruleSecondAmount)ruleSecondAmount.textContent=this.baseAmount+1;if(ruleSecondThreshold)ruleSecondThreshold.textContent=this.baseAmount+(this.baseAmount+1);if(ruleThirdAmount)ruleThirdAmount.textContent=this.baseAmount+2;if(ruleThirdThreshold)ruleThirdThreshold.textContent=this.baseAmount+(this.baseAmount+1)+(this.baseAmount+2);}
generateGiveRecords(options={}){const{startDate:inputStartDate=null,endDate:inputEndDate=null,clearExisting=false,source='auto'}=options;const startDate=inputStartDate||this.startDate;if(!startDate){if(clearExisting){this.giveRecords=[];this.saveGiveRecords();}
return[];}
const today=new Date();const endDate=inputEndDate||today;endDate.setHours(23,59,59,999);if(clearExisting){this.giveRecords=[];}
const allTimePoints=this.getAllTimePoints(startDate,endDate);const newRecords=[];let runningBalance=0;for(const timePoint of allTimePoints){const{date,type,data}=timePoint;if(type==='spend'){runningBalance-=data.amount;}else if(type==='monday'){const giveAmount=this.calculateGiveAmount(runningBalance);const record={id:Date.now()+Math.random(),date:date,amount:giveAmount,note:this.generateGiveNote(source,runningBalance,date),autoGenerated:source!=='manual',timestamp:new Date().toISOString(),source:source};newRecords.push(record);runningBalance+=giveAmount;}}
if(newRecords.length>0){if(clearExisting){this.giveRecords=newRecords;}else{const existingDates=new Set(this.giveRecords.map(r=>r.date));const uniqueNewRecords=newRecords.filter(r=>!existingDates.has(r.date));this.giveRecords.push(...uniqueNewRecords);}
this.giveRecords.sort((a,b)=>new Date(a.date)-new Date(b.date));this.saveGiveRecords();}
return newRecords;}
getAllTimePoints(startDate,endDate){const timePoints=[];const start=new Date(startDate);const end=new Date(endDate);let currentDate=new Date(start);while(currentDate<=end){if(currentDate.getDay()===1){const dateStr=currentDate.toISOString().split('T')[0];timePoints.push({date:dateStr,type:'monday',timestamp:currentDate.getTime()});}
currentDate.setDate(currentDate.getDate()+1);}
this.spendRecords.forEach(record=>{const recordDate=new Date(record.date);if(recordDate>=start&&recordDate<=end){timePoints.push({date:record.date,type:'spend',data:record,timestamp:recordDate.getTime()});}});timePoints.sort((a,b)=>{if(a.date===b.date){return a.type==='spend'?-1:1;}
return a.timestamp-b.timestamp;});return timePoints;}
generateGiveNote(source,balance,date){const sourceText={'auto':'自动发放','restore':'恢复计算','manual':'手动发放'}[source]||'自动发放';return`${sourceText} - 余额¥${balance.toFixed(2)}`;}
calculateBalanceAtDate(targetDate){const targetDateStr=targetDate.toISOString().split('T')[0];const totalGiven=this.giveRecords.filter(record=>record.date<=targetDateStr).reduce((sum,record)=>sum+record.amount,0);const totalSpent=this.spendRecords.filter(record=>record.date<=targetDateStr).reduce((sum,record)=>sum+record.amount,0);return totalGiven-totalSpent;}
calculateBalanceBeforeDate(targetDate){const targetDateStr=targetDate.toISOString().split('T')[0];const totalGiven=this.giveRecords.filter(record=>record.date<targetDateStr).reduce((sum,record)=>sum+record.amount,0);const totalSpent=this.spendRecords.filter(record=>record.date<targetDateStr).reduce((sum,record)=>sum+record.amount,0);return totalGiven-totalSpent;}
handleGenerateRecords(){const startDateInput=document.getElementById('startDate').value;if(!startDateInput){this.showMessage('请选择开始发放日期');return;}
this.saveStartDate(startDateInput);const newRecords=this.generateGiveRecords({startDate:startDateInput,clearExisting:true,source:'auto'});if(newRecords.length>0){this.currentPage=1;this.updateDisplay();this.updateGiveStats();this.showMessage(`成功生成 ${newRecords.length} 条发放记录！`);setTimeout(()=>this.updateLevelDisplay(),100);}else{this.showMessage('没有需要生成的发放记录');}}
recalculateGiveRecordsAfterDate(spendDate){const spendDateObj=new Date(spendDate);const today=new Date();today.setHours(23,59,59,999);const affectedRecords=this.giveRecords.filter(record=>{const recordDate=new Date(record.date);return recordDate>spendDateObj&&recordDate<=today&&record.autoGenerated;});if(affectedRecords.length===0){return;}
this.giveRecords=this.giveRecords.filter(record=>{const recordDate=new Date(record.date);return!(recordDate>spendDateObj&&recordDate<=today&&record.autoGenerated);});const newRecords=this.generateGiveRecords({startDate:this.startDate,endDate:today,clearExisting:false,source:'auto'});if(newRecords.length>0){this.updateDisplay();this.updateGiveStats();}}
getThresholds(){const thresholds=[];let sum=0;for(let i=0;i<100;i++){sum+=this.baseAmount+i;thresholds.push(sum);}
return thresholds;}
calculateGiveAmount(balance){const thresholds=this.getThresholds();for(let i=0;i<thresholds.length;i++){if(balance<thresholds[i]){return this.baseAmount+i;}}
return this.baseAmount+thresholds.length;}
calculateNextWeekAmount(){const currentBalance=this.getCurrentBalance();return this.calculateGiveAmount(currentBalance);}
updateNextWeekAmount(){const nextWeekAmountElement=document.getElementById('nextWeekAmount');if(nextWeekAmountElement){const nextWeekAmount=this.calculateNextWeekAmount();nextWeekAmountElement.textContent=`¥${nextWeekAmount.toFixed(2)}`;}}
getCurrentBalance(){const totalGiven=this.giveRecords.reduce((sum,record)=>sum+record.amount,0);const totalSpent=this.spendRecords.reduce((sum,record)=>sum+record.amount,0);return totalGiven-totalSpent;}
getTotalStats(){const totalGiven=this.giveRecords.reduce((sum,record)=>sum+record.amount,0);const totalSpent=this.spendRecords.reduce((sum,record)=>sum+record.amount,0);return{totalGiven,totalSpent};}
getMonthStats(){const now=new Date();const currentMonth=now.getMonth();const currentYear=now.getFullYear();const monthGiven=this.giveRecords.filter(record=>{const recordDate=new Date(record.date);return recordDate.getMonth()===currentMonth&&recordDate.getFullYear()===currentYear;}).reduce((sum,record)=>sum+record.amount,0);const monthSpent=this.spendRecords.filter(record=>{const recordDate=new Date(record.date);return recordDate.getMonth()===currentMonth&&recordDate.getFullYear()===currentYear;}).reduce((sum,record)=>sum+record.amount,0);return{monthGiven,monthSpent};}
getAllMonthStats(){const monthStats={};const allDates=[];this.giveRecords.forEach(record=>allDates.push(record.date));this.spendRecords.forEach(record=>allDates.push(record.date));allDates.forEach(dateStr=>{const date=new Date(dateStr);const year=date.getFullYear();const month=date.getMonth();const key=`${year}-${month.toString().padStart(2, '0')}`;if(!monthStats[key]){monthStats[key]={year:year,month:month,monthName:`${year}年${(month + 1).toString().padStart(2, '0')}月`,given:0,spent:0};}});this.giveRecords.forEach(record=>{const date=new Date(record.date);const year=date.getFullYear();const month=date.getMonth();const key=`${year}-${month.toString().padStart(2, '0')}`;if(monthStats[key]){monthStats[key].given+=record.amount;}});this.spendRecords.forEach(record=>{const date=new Date(record.date);const year=date.getFullYear();const month=date.getMonth();const key=`${year}-${month.toString().padStart(2, '0')}`;if(monthStats[key]){monthStats[key].spent+=record.amount;}});return Object.values(monthStats).sort((a,b)=>{if(a.year!==b.year)return b.year-a.year;return b.month-a.month;});}
saveSpendRecord(){const spendDate=document.getElementById('spendDate').value;const spendAmount=parseFloat(document.getElementById('spendAmount').value);const spendCategory=document.getElementById('spendCategory').value;const spendNote=document.getElementById('spendNote').value;if(!spendDate){this.showMessage('请选择消费日期');return;}
if(!spendAmount||spendAmount<=0){this.showMessage('请输入有效的消费金额');return;}
const record={id:Date.now(),date:spendDate,amount:spendAmount,category:spendCategory,note:spendNote,timestamp:new Date().toISOString()};this.spendRecords.push(record);this.spendRecords.sort((a,b)=>new Date(a.date)-new Date(b.date));this.saveSpendRecords();this.recalculateGiveRecordsAfterDate(spendDate);this.updateDisplay();this.resetSpendForm();this.showMessage('消费记录保存成功！');setTimeout(()=>this.updateLevelDisplay(),100);}
updateGiveStats(){const totalGiveCount=this.giveRecords.length;const totalGiveAmount=this.giveRecords.reduce((sum,record)=>sum+record.amount,0);document.getElementById('totalGiveCount').textContent=totalGiveCount;document.getElementById('totalGiveAmount').textContent=`¥${totalGiveAmount.toFixed(2)}`;}
resetSpendForm(){document.getElementById('spendAmount').value='10';document.getElementById('spendCategory').value='food';document.getElementById('spendNote').value='';}
updateDisplay(){const currentBalance=this.getCurrentBalance();const{totalGiven,totalSpent}=this.getTotalStats();document.getElementById('totalAmount').textContent=`¥${currentBalance.toFixed(2)}`;document.getElementById('totalGiven').textContent=`¥${totalGiven.toFixed(2)}`;document.getElementById('totalSpent').textContent=`¥${totalSpent.toFixed(2)}`;this.updateLevelDisplay();this.updateNextWeekAmount();}
updateHistory(filter='all'){const historyList=document.getElementById('historyList');const pagination=document.getElementById('pagination');const prevPage=document.getElementById('prevPage');const nextPage=document.getElementById('nextPage');const pageInfo=document.getElementById('pageInfo');let allRecords=[];this.giveRecords.forEach(record=>{allRecords.push({...record,type:'give',icon:'payments',color:'green',label:'发放'});});this.spendRecords.forEach(record=>{allRecords.push({...record,type:'spend',icon:'shopping_cart',color:'red',label:'消费'});});if(filter!=='all'){allRecords=allRecords.filter(record=>record.type===filter);}
allRecords.sort((a,b)=>new Date(b.date)-new Date(a.date));if(allRecords.length===0){historyList.innerHTML=`
                <div class="text-center text-gray-500 py-4">
                    <span class="material-icons text-2xl mb-2">receipt_long</span>
                    <p class="text-sm">暂无记录</p>
                </div>
            `;pagination.classList.add('hidden');return;}
const totalPages=Math.ceil(allRecords.length/this.itemsPerPage);const startIndex=(this.currentPage-1)*this.itemsPerPage;const endIndex=startIndex+this.itemsPerPage;const currentRecords=allRecords.slice(startIndex,endIndex);historyList.innerHTML=currentRecords.map(record=>{const recordDate=new Date(record.date);const balanceBefore=this.calculateBalanceBeforeDate(recordDate);const balanceAfter=this.calculateBalanceAtDate(recordDate);const categoryText=record.category?this.getCategoryText(record.category):'';const noteText=record.note?` - ${record.note}`:'';const categoryDisplay=categoryText?` | ${categoryText}`:'';const deleteButton=record.type==='spend'?`
                <button class="delete-btn ml-2 text-red-500 hover:text-red-700" data-id="${record.id}" data-testid="delete-${record.id}">
                    <span class="material-icons text-sm">delete</span>
                </button>
            `:'';return`
                <div class="history-row bg-gray-50 rounded-lg p-3">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center text-sm font-medium text-gray-800">
                            <span class="material-icons text-lg mr-2 text-${record.color}-600">${record.icon}</span>
                            ${record.label}
                            ${deleteButton}
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-semibold text-${record.color}-600">
                                ${record.type === 'give' ? '+' : '-'}¥${record.amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-600 mb-1">
                        ${record.date}${categoryDisplay}${noteText}
                    </div>
                    <div class="flex justify-between items-center text-xs">
                        <div class="text-gray-500">
                            交易前: ¥${balanceBefore.toFixed(2)}
                        </div>
                        <div class="font-medium text-gray-700">
                            交易后: ¥${balanceAfter.toFixed(2)}
                        </div>
                    </div>
                </div>
            `;}).join('');if(totalPages>1){pagination.classList.remove('hidden');prevPage.disabled=this.currentPage===1;nextPage.disabled=this.currentPage===totalPages;pageInfo.textContent=`第 ${this.currentPage} 页 / 共 ${totalPages} 页`;}else{pagination.classList.add('hidden');}
this.bindDeleteEvents();}
updateMonthStats(){const monthStatsList=document.getElementById('monthStatsList');const monthStatsPagination=document.getElementById('monthStatsPagination');const monthStatsPrevPage=document.getElementById('monthStatsPrevPage');const monthStatsNextPage=document.getElementById('monthStatsNextPage');const monthStatsPageInfo=document.getElementById('monthStatsPageInfo');const monthStats=this.getAllMonthStats();if(!monthStatsList){return;}
if(monthStats.length===0){monthStatsList.innerHTML=`
                <div class="text-center text-gray-500 py-8">
                    <span class="material-icons text-2xl mb-2">bar_chart</span>
                    <p class="text-sm">暂无统计数据</p>
                </div>
            `;if(monthStatsPagination){monthStatsPagination.classList.add('hidden');}
return;}
const totalPages=Math.ceil(monthStats.length/this.monthStatsPerPage);const startIndex=(this.monthStatsPage-1)*this.monthStatsPerPage;const endIndex=startIndex+this.monthStatsPerPage;const currentMonthStats=monthStats.slice(startIndex,endIndex);monthStatsList.innerHTML=currentMonthStats.map(stat=>{const netAmount=stat.given-stat.spent;const netColor=netAmount>=0?'green':'red';const netText=netAmount>=0?'结余':'超支';return`
                <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-base font-semibold text-gray-800">
                            ${stat.monthName}
                        </div>
                        <div class="text-sm font-medium text-${netColor}-600">
                            ${netText} ¥${Math.abs(netAmount).toFixed(2)}
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-lg font-semibold text-green-600">
                                +¥${stat.given.toFixed(2)}
                            </div>
                            <div class="text-xs text-gray-500">发放金额</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold text-red-600">
                                -¥${stat.spent.toFixed(2)}
                            </div>
                            <div class="text-xs text-gray-500">消费金额</div>
                        </div>
                    </div>
                </div>
            `;}).join('');if(monthStatsPagination&&monthStatsPrevPage&&monthStatsNextPage&&monthStatsPageInfo){if(totalPages>1){monthStatsPagination.classList.remove('hidden');monthStatsPrevPage.disabled=this.monthStatsPage===1;monthStatsNextPage.disabled=this.monthStatsPage===totalPages;monthStatsPageInfo.textContent=`第 ${this.monthStatsPage} 页 / 共 ${totalPages} 页`;}else{monthStatsPagination.classList.add('hidden');}}}
bindDeleteEvents(){const deleteButtons=document.querySelectorAll('.delete-btn');deleteButtons.forEach(button=>{button.addEventListener('click',(e)=>{const id=parseInt(e.currentTarget.dataset.id);this.showDeleteConfirm(id);});});const deleteConfirmClose=document.getElementById('deleteConfirmClose');const cancelDeleteBtn=document.getElementById('cancelDeleteBtn');const confirmDeleteBtn=document.getElementById('confirmDeleteBtn');const deleteConfirmModal=document.getElementById('deleteConfirmModal');if(deleteConfirmClose){deleteConfirmClose.addEventListener('click',()=>{this.hideDeleteConfirm();});}
if(cancelDeleteBtn){cancelDeleteBtn.addEventListener('click',()=>{this.hideDeleteConfirm();});}
if(confirmDeleteBtn){confirmDeleteBtn.addEventListener('click',()=>{this.confirmDelete();});}
if(deleteConfirmModal){deleteConfirmModal.addEventListener('click',(e)=>{if(e.target===deleteConfirmModal){this.hideDeleteConfirm();}});}}
showDeleteConfirm(id){const record=this.spendRecords.find(r=>r.id===id);if(!record)return;this.pendingDeleteId=id;const recordInfo=document.getElementById('deleteRecordInfo');const categoryText=record.category?this.getCategoryText(record.category):'';const noteText=record.note||'';recordInfo.innerHTML=`
            <div class="record-info-item">
                <span class="record-info-label">消费日期：</span>
                <span class="record-info-value">${record.date}</span>
            </div>
            <div class="record-info-item">
                <span class="record-info-label">消费金额：</span>
                <span class="record-info-value record-amount">¥${record.amount.toFixed(2)}</span>
            </div>
            ${categoryText ? `<div class="record-info-item"><span class="record-info-label">消费类型：</span><span class="record-info-value">${categoryText}</span></div>` : ''}
            ${noteText ? `<div class="record-info-item"><span class="record-info-label">备注：</span><span class="record-info-value">${noteText}</span></div>` : ''}
        `;const modal=document.getElementById('deleteConfirmModal');modal.classList.add('show');}
hideDeleteConfirm(){const modal=document.getElementById('deleteConfirmModal');modal.classList.remove('show');this.pendingDeleteId=null;}
confirmDelete(){if(this.pendingDeleteId){this.deleteSpendRecord(this.pendingDeleteId);this.hideDeleteConfirm();}}
deleteSpendRecord(id){const index=this.spendRecords.findIndex(record=>record.id===id);if(index!==-1){const deletedRecord=this.spendRecords[index];this.spendRecords.splice(index,1);this.saveSpendRecords();this.recalculateGiveRecordsAfterDate(deletedRecord.date);this.currentPage=1;this.updateDisplay();this.showMessage('消费记录已删除！');setTimeout(()=>this.updateLevelDisplay(),100);}}
getCategoryText(category){const categories={food:'餐饮',toy:'玩具',book:'文具书籍',snack:'零食',other:'其他'};return categories[category]||category;}
calculateYearEndPrediction(){const now=new Date();const currentYear=now.getFullYear();const yearEnd=new Date(currentYear,11,31);if(now>yearEnd){return this.getPiggyBankLevel(this.getCurrentBalance());}
let remainingWeeks=0;let currentDate=new Date(now);currentDate.setDate(currentDate.getDate()+1);while(currentDate<=yearEnd){if(currentDate.getDay()===1){remainingWeeks++;}
currentDate.setDate(currentDate.getDate()+1);}
const currentNextWeekAmount=this.calculateNextWeekAmount();const yearEndNextWeekAmount=currentNextWeekAmount+remainingWeeks;const predictedLevel=Math.max(1,yearEndNextWeekAmount-this.baseAmount);return{level:predictedLevel,name:this.getLevelName(predictedLevel),icon:predictedLevel>=10?'diamond':'savings',min:0,max:0};}
getLevelName(level){if(level<5)return'咖宝学徒';if(level<10)return'见习咖宝';if(level<15)return'极速先锋';if(level<20)return'特警卫士';if(level<25)return'重装巨人';if(level<30)return'传说召唤师';if(level<35)return'暴风统帅';if(level<40)return'晶钻领主';if(level<45)return'四变兽王';if(level<50)return'黄金战神';if(level<55)return'双星大元帅';if(level<60)return'银河霸主';return'时空创世神';}
getPiggyBankLevelByTotalGiven(totalGiven){const originalRecords=[...this.giveRecords];this.giveRecords=[{amount:totalGiven,date:new Date().toISOString()}];const nextWeekAmount=this.calculateGiveAmount(totalGiven);this.giveRecords=originalRecords;const level=Math.max(1,nextWeekAmount-this.baseAmount);if(level<=2)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=4)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=6)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=8)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=10)return{level:level,name:this.getLevelName(level),icon:'diamond',min:0,max:0};return{level:level,name:this.getLevelName(level),icon:'auto_awesome',min:0,max:0};}
getPiggyBankLevel(balance){const nextWeekAmount=this.calculateNextWeekAmount();const level=Math.max(1,nextWeekAmount-this.baseAmount);if(level<=2)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=4)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=6)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=8)return{level:level,name:this.getLevelName(level),icon:'savings',min:0,max:0};if(level<=10)return{level:level,name:this.getLevelName(level),icon:'diamond',min:0,max:0};return{level:level,name:this.getLevelName(level),icon:'auto_awesome',min:0,max:0};}
updateLevelDisplay(){const currentBalance=this.getCurrentBalance();const levelInfo=this.getPiggyBankLevel(currentBalance);const yearEndPrediction=this.calculateYearEndPrediction();this.previousLevel=this.currentLevel;this.currentLevel=levelInfo.level;this.updateLevelIcons(levelInfo.level);const levelCurrentEl=document.getElementById('levelCurrent');const levelTextEl=document.getElementById('levelText');const yearEndLevelEl=document.getElementById('yearEndLevel');const yearEndTextEl=document.getElementById('yearEndText');if(levelCurrentEl)levelCurrentEl.textContent=`Lv.${levelInfo.level}`;if(levelTextEl)levelTextEl.textContent=levelInfo.name;if(yearEndLevelEl)yearEndLevelEl.textContent=`Lv.${yearEndPrediction.level} ${yearEndPrediction.name}`;if(yearEndTextEl){const levelDiff=yearEndPrediction.level-levelInfo.level;if(levelDiff>0){yearEndTextEl.textContent=`还可升${levelDiff}级`;}else if(levelDiff===0){yearEndTextEl.textContent='保持当前等级';}else{yearEndTextEl.textContent='已满级';}}
if(this.currentLevel>this.previousLevel){this.playUpgradeAnimation();}}
updateLevelIcons(currentLevel){const iconsContainer=document.getElementById('levelIcons');if(!iconsContainer){console.warn('Level icons container not found');return;}
iconsContainer.innerHTML='';const totalStars=currentLevel;const moons=Math.floor(totalStars/5);const remainingStars=totalStars%5;const suns=Math.floor(moons/5);const remainingMoons=moons%5;for(let i=0;i<suns;i++){const icon=document.createElement('div');icon.className='level-icon sun active';icon.innerHTML='☀';icon.title=`太阳 (${(i + 1) * 25}级)`;iconsContainer.appendChild(icon);}
for(let i=0;i<remainingMoons;i++){const icon=document.createElement('div');icon.className='level-icon moon active';icon.innerHTML='🌙';icon.title=`月亮 (${suns * 25 + (i + 1) * 5}级)`;iconsContainer.appendChild(icon);}
for(let i=0;i<remainingStars;i++){const icon=document.createElement('div');icon.className='level-icon star active';icon.innerHTML='⭐';icon.title=`星星 (${suns * 25 + remainingMoons * 5 + (i + 1)}级)`;iconsContainer.appendChild(icon);}
if(suns===0&&remainingMoons===0&&remainingStars===0){const icon=document.createElement('div');icon.className='level-icon star inactive';icon.innerHTML='⭐';icon.title='未开始';iconsContainer.appendChild(icon);}}
playUpgradeAnimation(){const piggyBank=document.getElementById('piggyBank');const upgradeEffect=document.getElementById('upgradeEffect');const piggyBankContainer=document.getElementById('piggyBankContainer')||document.querySelector('.level-container');if(!piggyBank||!upgradeEffect){console.warn('Required elements for upgrade animation not found');return;}
piggyBank.classList.add('upgrading');upgradeEffect.classList.remove('hidden');if(piggyBankContainer){this.createSparkles(piggyBankContainer);}
const levelInfo=this.getPiggyBankLevel(this.getCurrentBalance());const nextWeekAmount=this.calculateNextWeekAmount();this.showMessage(`🎉 恭喜升级！当前级别${levelInfo.level}级，下周将获得${nextWeekAmount}元`);setTimeout(()=>{if(piggyBank)piggyBank.classList.remove('upgrading');if(upgradeEffect)upgradeEffect.classList.add('hidden');},800);}
createSparkles(container){if(!container){console.warn('Container for sparkles not found');return;}
const sparkleCount=8;const containerRect=container.getBoundingClientRect();for(let i=0;i<sparkleCount;i++){setTimeout(()=>{const sparkle=document.createElement('div');if(!sparkle)return;sparkle.className='sparkle';sparkle.innerHTML='<span class="material-icons">star</span>';const angle=(Math.PI*2*i)/sparkleCount;const radius=40;const x=Math.cos(angle)*radius;const y=Math.sin(angle)*radius;if(sparkle.style&&container&&container.appendChild){sparkle.style.left=`${containerRect.width / 2 + x}px`;sparkle.style.top=`${containerRect.height / 2 + y}px`;container.appendChild(sparkle);setTimeout(()=>{if(sparkle&&sparkle.parentNode&&sparkle.parentNode.contains&&sparkle.parentNode.contains(sparkle)){sparkle.parentNode.removeChild(sparkle);}},1000);}},i*100);}}
showMessage(message){const messageDiv=document.createElement('div');if(!messageDiv)return;messageDiv.className='fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';messageDiv.innerHTML=`
            <div class="flex items-center">
                <span class="material-icons text-green-600 mr-2">check_circle</span>
                <span class="text-gray-800">${message}</span>
            </div>
        `;document.body.appendChild(messageDiv);setTimeout(()=>{if(messageDiv&&messageDiv.style){messageDiv.style.opacity='0';}
setTimeout(()=>{if(messageDiv&&document.body.contains(messageDiv)){document.body.removeChild(messageDiv);}},300);},2000);}
createBackup(){const backup={version:'2.1.0',timestamp:new Date().toISOString(),data:{startDate:this.startDate,spendRecords:this.spendRecords,baseAmount:this.baseAmount}};return JSON.stringify(backup,null,2);}
saveBackup(){const backup=this.createBackup();const backupKey=`pocketMoneyBackup_${new Date().toISOString().split('T')[0]}`;localStorage.setItem(backupKey,backup);this.cleanOldBackups();this.showMessage('数据已自动备份！');}
cleanOldBackups(){const keys=Object.keys(localStorage).filter(key=>key.startsWith('pocketMoneyBackup_'));const thirtyDaysAgo=new Date();thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);keys.forEach(key=>{const dateStr=key.replace('pocketMoneyBackup_','');const backupDate=new Date(dateStr);if(backupDate<thirtyDaysAgo){localStorage.removeItem(key);}});}
getBackupList(){const keys=Object.keys(localStorage).filter(key=>key.startsWith('pocketMoneyBackup_'));return keys.map(key=>{const dateStr=key.replace('pocketMoneyBackup_','');const backup=JSON.parse(localStorage.getItem(key));const isOptimized=backup.version>='2.1.0';return{key:key,date:dateStr,timestamp:backup.timestamp,spendCount:(backup.data&&backup.data.spendRecords)?backup.data.spendRecords.length:0,isOptimized:isOptimized,version:backup.version};}).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));}
restoreFromBackup(backupKey){try{console.log('开始恢复备份:',backupKey);const backup=JSON.parse(localStorage.getItem(backupKey));console.log('备份数据:',backup);if(!backup||!backup.data){throw new Error('备份文件格式错误');}
this.clearAllData();console.log('已清空当前数据');this.startDate=backup.data.startDate;this.spendRecords=backup.data.spendRecords||[];if(backup.data.baseAmount){this.baseAmount=backup.data.baseAmount;}
console.log('已恢复备份数据:',{startDate:this.startDate,spendRecords:this.spendRecords.length,baseAmount:this.baseAmount});this.saveStartDate(this.startDate);this.saveSpendRecords();console.log('已保存数据到localStorage');if(this.startDate){this.regenerateGiveRecords();console.log('已重新生成发放记录:',this.giveRecords.length);}
this.setDefaultDates();this.updateDisplay();this.updateGiveStats();this.updateLevelDisplay();this.updateBackupList();this.showMessage('数据恢复成功！发放记录已根据消费记录重新计算');console.log('恢复完成');}catch(error){console.error('恢复数据失败:',error);this.showMessage('数据恢复失败：'+error.message);}}
generateTextBackup(){try{const backupData={version:'2.1.0',timestamp:new Date().toISOString(),data:{startDate:this.startDate,spendRecords:this.spendRecords,baseAmount:this.baseAmount}};const backupText=JSON.stringify(backupData,null,2);const modal=document.createElement('div');if(!modal)return;modal.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;modal.innerHTML=`
                <div style="background: white; padding: 25px; border-radius: 12px; max-width: 90%; max-height: 80%; overflow-y: auto; width: 100%;">
                    <h2 style="margin: 0 0 15px 0; color: #333; text-align: center;">
                        <span class="material-icons" style="vertical-align: middle; margin-right: 8px; color: #007AFF;">content_copy</span>
                        优化备份数据文本
                    </h2>
                    <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4CAF50;">
                        <p style="margin: 0; color: #2E7D32; font-size: 14px;">
                            <strong>🎯 优化备份说明：</strong><br>
                            1. 发放记录已移除，恢复时自动重新计算<br>
                            2. 只备份消费记录和开始日期，体积更小<br>
                            3. 点击"复制备份"按钮将文本复制到剪贴板<br>
                            4. 将文本保存到备忘录、微信或其他安全地方<br>
                            5. 恢复数据时，将完整文本粘贴到恢复框中
                        </p>
                    </div>
                    <textarea readonly style="width: 100%; height: 300px; font-family: 'Courier New', monospace; font-size: 11px; padding: 15px; border: 2px solid #ddd; border-radius: 8px; background: #f8f9fa; resize: vertical;">${backupText}</textarea>
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="copyBackupText()" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-size: 16px;">
                            <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">content_copy</span>
                            复制备份
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                            <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">close</span>
                            关闭
                        </button>
                    </div>
                </div>
            `;document.body.appendChild(modal);window.copyBackupText=function(){const textarea=modal?modal.querySelector('textarea'):null;if(!textarea)return;textarea.select();textarea.setSelectionRange(0,99999);try{document.execCommand('copy');alert('✅ 优化备份数据已复制到剪贴板！\n\n发放记录将自动重新计算，请将文本保存到安全的地方。');}catch(err){if(navigator.clipboard){navigator.clipboard.writeText(backupText).then(()=>{alert('✅ 优化备份数据已复制到剪贴板！\n\n发放记录将自动重新计算，请将文本保存到安全的地方。');}).catch(()=>{alert('❌ 复制失败，请手动选择文本进行复制。');});}else{alert('❌ 复制失败，请手动选择文本进行复制。');}}};this.showMessage('优化备份数据已生成，发放记录将自动重新计算');}catch(error){console.error('生成备份失败:',error);this.showMessage('生成备份失败：'+error.message);}}
regenerateGiveRecords(){this.generateGiveRecords({clearExisting:true,source:'restore'});}
restoreFromText(){const restoreDataText=document.getElementById('restoreDataText');const backupText=restoreDataText.value.trim();if(!backupText){this.showMessage('请粘贴备份数据文本');return;}
this.showRestoreConfirm(()=>{this.performRestore(backupText,restoreDataText);});}
showRestoreConfirm(onConfirm){const modal=document.createElement('div');if(!modal)return;modal.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;modal.innerHTML=`
            <div style="background: white; padding: 25px; border-radius: 12px; max-width: 90%; max-height: 80%; overflow-y: auto; width: 100%;">
                <h2 style="margin: 0 0 15px 0; color: #333; text-align: center;">
                    <span class="material-icons" style="vertical-align: middle; margin-right: 8px; color: #ff9800;">warning</span>
                    确认恢复数据
                </h2>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                        ⚠️ <strong>重要提醒：</strong><br>
                        这将完全清空当前所有数据并恢复备份数据<br>
                        发放记录将根据消费记录自动重新计算<br>
                        建议先备份当前数据
                    </p>
                </div>
                <div style="text-align: center;">
                    <button onclick="confirmRestore()" style="background: #ff9800; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-size: 16px;">
                        <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">check</span>
                        确认恢复
                    </button>
                    <button onclick="cancelRestore()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">close</span>
                        取消
                    </button>
                </div>
            </div>
        `;document.body.appendChild(modal);window.confirmRestore=()=>{if(document.body.contains(modal)){document.body.removeChild(modal);}
delete window.confirmRestore;delete window.cancelRestore;onConfirm();};window.cancelRestore=()=>{if(document.body.contains(modal)){document.body.removeChild(modal);}
delete window.confirmRestore;delete window.cancelRestore;};modal.addEventListener('click',(e)=>{if(e.target===modal&&document.body.contains(modal)){window.cancelRestore();}});}
performRestore(backupText,restoreDataText){try{const backupData=JSON.parse(backupText);if(!backupData.version||!backupData.data){throw new Error('备份数据格式不正确');}
if(!backupData.data.spendRecords){throw new Error('备份数据缺少必要字段');}
this.clearAllData();this.startDate=backupData.data.startDate;this.spendRecords=backupData.data.spendRecords||[];if(backupData.data.baseAmount){this.baseAmount=backupData.data.baseAmount;}
localStorage.setItem('pocketMoneyStartDate',this.startDate);localStorage.setItem('pocketMoneySpendRecords',JSON.stringify(this.spendRecords));if(this.baseAmount!==6){localStorage.setItem('pocketMoneyBaseAmount',this.baseAmount.toString());}
if(this.startDate){this.regenerateGiveRecords();}
this.setDefaultDates();this.updateDisplay();this.updateGiveStats();this.updateLevelDisplay();this.updateBackupList();if(restoreDataText&&restoreDataText.value!==undefined){restoreDataText.value='';}
this.showMessage('✅ 数据恢复成功！\n\n发放记录：'+this.giveRecords.length+' 条（根据消费记录重新计算）\n消费记录：'+this.spendRecords.length+' 条');}catch(error){console.error('恢复数据失败:',error);this.showMessage('❌ 数据恢复失败：'+error.message+'\n\n请检查备份数据是否完整且格式正确。');}}
clearAllData(){this.startDate=null;this.giveRecords=[];this.spendRecords=[];this.currentPage=1;localStorage.removeItem('pocketMoneyStartDate');localStorage.removeItem('pocketMoneyGiveRecords');localStorage.removeItem('pocketMoneySpendRecords');localStorage.removeItem('pocketMoneyBaseAmount');this.baseAmount=6;}
updateBackupList(){const backupList=document.getElementById('backupList');if(!backupList){console.warn('Backup list element not found');return;}
const backups=this.getBackupList();if(backups.length===0){backupList.innerHTML=`
                <div class="text-center text-gray-500 py-4">
                    <span class="material-icons text-lg mb-2">backup</span>
                    <p class="text-sm">暂无备份记录</p>
                </div>
            `;return;}
backupList.innerHTML=backups.map(backup=>{const versionBadge=backup.isOptimized?'<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">优化版</span>':'<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">标准版</span>';return`
                <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <div class="text-sm font-medium text-gray-800">${backup.date}</div>
                            ${versionBadge}
                        </div>
                        <div class="text-xs text-gray-600">
                            ${backup.isOptimized ? '消费记录' : '发放记录'}: ${backup.isOptimized ? backup.spendCount : '自动计算'}条
                            ${!backup.isOptimized ? `,消费记录:${backup.spendCount}条` : ''}
                        </div>
                    </div>
                    <button 
                        onclick="window.pocketMoneyManager.restoreFromBackup('${backup.key}')"
                        class="px-3 py-1 text-xs ${backup.isOptimized ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded transition-colors"
                        data-testid="restore-backup-${backup.date}"
                    >
                        恢复
                    </button>
                </div>
            `;}).join('');}
showLevelModal(){const modal=document.getElementById('levelModal');const tableBody=document.getElementById('levelTableBody');const levelData=this.getLevelTableData();tableBody.innerHTML=levelData.map(item=>{const titleClass=this.getTitleClass(item.title);return`
                <tr>
                    <td>
                        <span class="level-badge">${item.range}</span>
                    </td>
                    <td>
                        <span class="level-title-badge ${titleClass}">${item.title}</span>
                    </td>
                </tr>
            `;}).join('');modal.classList.add('show');}
closeLevelModal(){const modal=document.getElementById('levelModal');if(modal){modal.classList.remove('show');}}
getLevelTableData(){return[{range:'Lv.1-4',title:'咖宝学徒'},{range:'Lv.5-9',title:'见习咖宝'},{range:'Lv.10-14',title:'极速先锋'},{range:'Lv.15-19',title:'特警卫士'},{range:'Lv.20-24',title:'重装巨人'},{range:'Lv.25-29',title:'传说召唤师'},{range:'Lv.30-34',title:'暴风统帅'},{range:'Lv.35-39',title:'晶钻领主'},{range:'Lv.40-44',title:'四变兽王'},{range:'Lv.45-49',title:'黄金战神'},{range:'Lv.50-54',title:'双星大元帅'},{range:'Lv.55-59',title:'银河霸主'},{range:'Lv.60+',title:'时空创世神'}];}
getTitleClass(title){const classMap={'咖宝学徒':'title-apprentice','见习咖宝':'title-novice','极速先锋':'title-pioneer','特警卫士':'title-guard','重装巨人':'title-giant','传说召唤师':'title-summoner','暴风统帅':'title-commander','晶钻领主':'title-lord','四变兽王':'title-beast','黄金战神':'title-god','双星大元帅':'title-marshal','银河霸主':'title-ruler','时空创世神':'title-creator'};return classMap[title]||'title-apprentice';}}
document.addEventListener('DOMContentLoaded',()=>{window.pocketMoneyManager=new PocketMoneyManager();});
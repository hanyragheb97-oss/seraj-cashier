// ==========================================
// ملف قاعدة البيانات (db.js) - النسخة السحابية - الجزء الأول
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyAlZNTVuPRBac0imbjhSTPprjxd5ynT3ZM",
    authDomain: "serajcashier-eff7b.firebaseapp.com",
    projectId: "serajcashier-eff7b",
    storageBucket: "serajcashier-eff7b.firebasestorage.app",
    messagingSenderId: "553341962511",
    appId: "1:553341962511:web:842f70d097f4c95477d67a",
    measurementId: "G-MFHRYK4LZX"
};

let cloudReady = false;
let isSyncing = false;

function initCloud() {
    let s1 = document.createElement('script');
    s1.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
    document.head.appendChild(s1);
    
    s1.onload = () => {
        let s2 = document.createElement('script');
        s2.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
        document.head.appendChild(s2);
        
        s2.onload = () => {
            firebase.initializeApp(firebaseConfig);
            window.dbCloud = firebase.firestore();
            cloudReady = true;
            showCloudStatus('🟢 متصل بالسحابة');
            syncFromCloud();
        };
    };
}

function showCloudStatus(msg) {
    let el = document.getElementById('cloud-sync-status');
    if(!el) {
        el = document.createElement('div');
        el.id = 'cloud-sync-status';
        el.style.cssText = 'position:fixed; bottom:15px; right:15px; background:rgba(0,0,0,0.8); color:#fff; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:bold; z-index:99999; border: 1px solid #a855f7; box-shadow: 0 0 10px rgba(168, 85, 247, 0.5); pointer-events: none;';
        document.body.appendChild(el);
    }
    el.innerText = msg;
}

function uploadToCloud(collection, data) {
    if(!cloudReady || isSyncing) return;
    showCloudStatus('⏳ جاري الرفع...');
    window.dbCloud.collection('shopData').doc(collection).set({
        data: JSON.stringify(data),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => showCloudStatus('🟢 تم الحفظ السحابي'))
    .catch(() => showCloudStatus('🔴 خطأ - الشغل محفوظ محلياً'));
}

function syncFromCloud() {
    if(!cloudReady || isSyncing) return;
    isSyncing = true;
    showCloudStatus('⏳ جاري تحديث البيانات...');
    
    window.dbCloud.collection('shopData').get().then((snapshot) => {
        let needsReload = false;
        snapshot.forEach(doc => {
            let colName = doc.id;
            let cloudDataStr = doc.data().data;
            let localDataStr = localStorage.getItem('seraj_' + colName);
            
            if(cloudDataStr && cloudDataStr !== localDataStr) {
                localStorage.setItem('seraj_' + colName, cloudDataStr);
                needsReload = true;
            }
        });
        showCloudStatus('🟢 محدث وجاهز');
        isSyncing = false;
        
        if(needsReload) {
            window.location.reload();
        }
    }).catch(err => {
        console.error(err);
        showCloudStatus('🔴 تعمل أوفلاين (بدون نت)');
        isSyncing = false;
    });
}
// ==========================================
// الجزء الثاني من ملف db.js
// ==========================================

const DB = {
    getProducts: function() { return JSON.parse(localStorage.getItem('seraj_products')) || []; },
    saveProducts: function(data) { 
        localStorage.setItem('seraj_products', JSON.stringify(data));
        uploadToCloud('products', data);
    },
    
    getCustomers: function() { return JSON.parse(localStorage.getItem('seraj_customers')) || []; },
    saveCustomers: function(data) { 
        localStorage.setItem('seraj_customers', JSON.stringify(data));
        uploadToCloud('customers', data);
    },
    
    getSalesInvoices: function() { return JSON.parse(localStorage.getItem('seraj_sales_invoices')) || []; },
    saveSalesInvoices: function(data) { 
        localStorage.setItem('seraj_sales_invoices', JSON.stringify(data));
        uploadToCloud('sales_invoices', data);
    },
    
    getSuppliers: function() { return JSON.parse(localStorage.getItem('seraj_suppliers')) || []; },
    saveSuppliers: function(data) { 
        localStorage.setItem('seraj_suppliers', JSON.stringify(data));
        uploadToCloud('suppliers', data);
    },
    
    getPurchaseInvoices: function() { return JSON.parse(localStorage.getItem('seraj_purchase_invoices')) || []; },
    savePurchaseInvoices: function(data) { 
        localStorage.setItem('seraj_purchase_invoices', JSON.stringify(data));
        uploadToCloud('purchase_invoices', data);
    },
    
    getVaults: function() { 
        let def = { main: 0, insta: 0, wallet: 0 };
        return JSON.parse(localStorage.getItem('seraj_vaults')) || def; 
    },
    saveVaults: function(data) { 
        localStorage.setItem('seraj_vaults', JSON.stringify(data));
        uploadToCloud('vaults', data);
    },
    
    getTreasuryMoves: function() { return JSON.parse(localStorage.getItem('seraj_treasury_moves')) || []; },
    saveTreasuryMoves: function(data) { 
        localStorage.setItem('seraj_treasury_moves', JSON.stringify(data));
        uploadToCloud('treasury_moves', data);
    },
    
    getTheme: function() { return localStorage.getItem('seraj_theme') || '#a855f7'; },
    saveTheme: function(color) { 
        localStorage.setItem('seraj_theme', color);
        this.applySavedTheme();
    },
    applySavedTheme: function() {
        let color = this.getTheme();
        document.documentElement.style.setProperty('--neon-border', color);
        let r=0, g=0, b=0;
        if(color === '#a855f7') {r=168; g=85; b=247;}
        else if(color === '#3b82f6') {r=59; g=130; b=246;}
        else if(color === '#10b981') {r=16; g=185; b=129;}
        else if(color === '#f59e0b') {r=245; g=158; b=11;}
        else if(color === '#ef4444') {r=239; g=68; b=68;}
        document.documentElement.style.setProperty('--neon-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
    }
};

// تشغيل الاتصال بالسحابة فوراً عند فتح البرنامج
initCloud();
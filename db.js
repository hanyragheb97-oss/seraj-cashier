// ==========================================
// ملف قاعدة البيانات (db.js) - التحديث الشامل للألوان والخزنة
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyAcoEKSWh2Gb" + "GZBndpQ0JMyGK8ZXZNPd4Q",
    authDomain: "serajcashier.firebaseapp.com",
    databaseURL: "https://serajcashier-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "serajcashier",
    storageBucket: "serajcashier.firebasestorage.app",
    messagingSenderId: "323411327594",
    appId: "1:323411327594:web:720d718ff222502167a813",
    measurementId: "G-6L4R753ZYS"
};

let cloudReady = false;

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
            
            // تفعيل خاصية العمل بدون إنترنت
            window.dbCloud.enablePersistence()
              .catch(function(err) {
                  console.log("مشكلة في وضع الأوفلاين: ", err);
              });

            cloudReady = true;
            showCloudStatus('🟢 متصل ومستعد');
            startRealtimeRadar(); 
        };
    };
}

function showCloudStatus(msg) {
    let el = document.getElementById('cloud-sync-status');
    if(!el) {
        el = document.createElement('div');
        el.id = 'cloud-sync-status';
        el.style.cssText = 'position:fixed; bottom:15px; right:15px; background:rgba(0,0,0,0.8); color:#fff; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:bold; z-index:99999; border: 1px solid var(--neon-border, #a855f7); box-shadow: 0 0 10px var(--neon-glow, rgba(168, 85, 247, 0.5)); pointer-events: none;';
        document.body.appendChild(el);
    }
    el.innerText = msg;
}

function startRealtimeRadar() {
    if(!cloudReady) return;
    
    window.dbCloud.collection('shopData').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                let colName = change.doc.id;
                let cloudDataStr = change.doc.data().data;
                let localDataStr = localStorage.getItem('seraj_' + colName);
                
                if(cloudDataStr && cloudDataStr !== localDataStr) {
                    localStorage.setItem('seraj_' + colName, cloudDataStr);
                    showCloudStatus('🔄 تحديث من جهاز آخر.. جاري المزامنة');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            }
        });
    }, (error) => {
        console.log("خطأ في الرادار: ", error);
        showCloudStatus('🔴 تعمل أوفلاين (بدون نت)');
    });
}

function uploadToCloud(collection, data) {
    if(!cloudReady) return;
    showCloudStatus('⏳ جاري الرفع...');
    window.dbCloud.collection('shopData').doc(collection).set({
        data: JSON.stringify(data),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => showCloudStatus('🟢 تم الحفظ اللحظي'))
    .catch(() => showCloudStatus('🔴 خطأ - الشغل محفوظ محلياً'));
}

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
        return JSON.parse(localStorage.getItem('seraj_vaults_v2')) || def; 
    },
    saveVaults: function(data) { 
        localStorage.setItem('seraj_vaults_v2', JSON.stringify(data));
        uploadToCloud('vaults_v2', data);
    },
    
    getTreasuryMoves: function() { return JSON.parse(localStorage.getItem('seraj_treasury_moves')) || []; },
    saveTreasuryMoves: function(data) { 
        localStorage.setItem('seraj_treasury_moves', JSON.stringify(data));
        uploadToCloud('treasury_moves', data);
    },
    
    applySavedTheme: function() {
        let b = localStorage.getItem('seraj_theme_border');
        let g = localStorage.getItem('seraj_theme_glow');
        let d1 = localStorage.getItem('seraj_theme_bg1');
        let d2 = localStorage.getItem('seraj_theme_bg2');
        let card = localStorage.getItem('seraj_theme_card');
        let text = localStorage.getItem('seraj_theme_text');
        
        if(b && g) {
            document.documentElement.style.setProperty('--neon-border', b);
            document.documentElement.style.setProperty('--neon-glow', g);
            if(d1) document.documentElement.style.setProperty('--bg-dark-1', d1);
            if(d2) document.documentElement.style.setProperty('--bg-dark-2', d2);
            if(card) document.documentElement.style.setProperty('--card-bg', card);
            if(text) {
                document.documentElement.style.setProperty('--text-main', text);
                document.documentElement.style.setProperty('--text-white', text); 
            }
        }
    }
};

initCloud();

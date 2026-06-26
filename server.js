const axios = require('axios');
const express = require('express');
const https = require('https');

// ======================
// CẤU HÌNH HỆ THỐNG
// ======================
const BASE = "https://aibcr.me";
const LOGIN_URL = `${BASE}/login`;
const LOBBY_URL = `${BASE}/ae/lobby`;
const GETNEWRESULT_URL = `${BASE}/baccarat/getnewresult`;

const USERNAME = "Hoang2285";
const PASSWORD = "hoang2010";

const agent = new https.Agent({ rejectUnauthorized: false });
let cookieJar = '';
let baccaratData = [];
let lastUpdate = null;

// ======================
// CẤU HÌNH AXIOS GIẢ LẬP TRÌNH DUYỆT THẬT
// ======================
const session = axios.create({
    baseURL: BASE,
    timeout: 20000,
    httpsAgent: agent,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
    }
});

// Bộ quản lý Cookie thông minh - Fix lỗi ghi đè mất Token
session.interceptors.request.use(config => {
    if (cookieJar) {
        config.headers.Cookie = cookieJar;
    }
    return config;
}, error => Promise.reject(error));

session.interceptors.response.use(res => {
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
        let cookieMap = new Map();
        // Nạp cookie cũ vào map
        if (cookieJar) {
            cookieJar.split(';').forEach(c => {
                const parts = c.trim().split('=');
                if (parts[0]) cookieMap.set(parts[0], parts.slice(1).join('='));
            });
        }
        // Ghi đè cookie mới từ server trả về
        setCookie.forEach(cookie => {
            const rawParts = cookie.split(';')[0];
            const eqIndex = rawParts.indexOf('=');
            if (eqIndex > 0) {
                const name = rawParts.substring(0, eqIndex).trim();
                const value = rawParts.substring(eqIndex + 1).trim();
                cookieMap.set(name, value);
            }
        });
        // Chuyển ngược lại thành chuỗi CookieJar
        let newJar = [];
        cookieMap.forEach((val, key) => {
            if (key) newJar.push(`${key}=${val}`);
        });
        cookieJar = newJar.join('; ') + ';';
    }
    return res;
}, error => Promise.reject(error));

// Trích xuất CSRF Token an toàn
function getCsrfToken(html) {
    if (!html || typeof html !== 'string') return null;
    const match = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
    return match ? match[1] : null;
}

// ======================
// LOGIC API CHÍNH
// ======================
async function login() {
    try {
        console.log('[AUTH] Đang tải trang đăng nhập...');
        cookieJar = ''; 
        const getResp = await session.get(LOGIN_URL);
        const token = getCsrfToken(getResp.data);
        
        if (!token) {
            console.error('[ERROR] Không lấy được CSRF Token từ HTML!');
            return false;
        }
        
        const formData = new URLSearchParams();
        formData.append('username', USERNAME);
        formData.append('password', PASSWORD);
        formData.append('_token', token);
        formData.append('action', 'Login');
        
        const headers = {
            'Referer': LOGIN_URL,
            'Origin': BASE,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        
        console.log('[AUTH] Gửi request đăng nhập...');
        const loginResp = await session.post(LOGIN_URL, formData.toString(), { headers });
        
        // Kiểm tra xem có redirect hoặc trả về thành công không
        if (loginResp.status === 200) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('[ERROR LOGIN]:', error.message);
        return false;
    }
}

async function goToLobby() {
    try {
        console.log('[LOBBY] Kích hoạt Session sảnh AE...');
        await session.get(LOBBY_URL, { 
            headers: { 'Referer': BASE } 
        });
        return true;
    } catch (error) {
        console.error('[ERROR LOBBY]:', error.message);
        return false;
    }
}

async function fetchBaccaratData() {
    try {
        let xsrfToken = '';
        const xsrfMatch = cookieJar.match(/XSRF-TOKEN=([^;]+)/);
        if (xsrfMatch) xsrfToken = decodeURIComponent(xsrfMatch[1]);
        
        const headers = {
            'Referer': LOBBY_URL,
            'Origin': BASE,
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };
        
        // Gửi cả chữ THƯỜNG và chữ HOA để phòng trường hợp backend đổi cấu trúc nhận diện
        const formData = new URLSearchParams();
        formData.append('gameCode', 'ae'); 
        
        const resp = await session.post(GETNEWRESULT_URL, formData.toString(), { headers });
        
        // Trường hợp bị đá session văng ra trang login
        if (resp.data && typeof resp.data === 'string' && (resp.data.includes('login') || resp.data.includes('Sign In'))) {
            throw new Error('SessionExpired');
        }

        // BẮT ĐẦU PHÂN TÍCH VÀ FIX LỖI MẤT BÀN
        if (resp.data && resp.data.data) {
            let listRaw = [];
            if (Array.isArray(resp.data.data)) {
                listRaw = resp.data.data;
            } else if (typeof resp.data.data === 'object') {
                listRaw = Object.values(resp.data.data); // Nếu API trả về dạng Object {} thay vì Array []
            }

            baccaratData = listRaw.map(item => {
                // Ép kiểu dữ liệu và quét sạch tất cả các Key có khả năng chứa Số Phiên / Mã Bàn
                return {
                    table: String(item.table_name || item.tableName || item.tableCode || item.table || 'Unknown'),
                    bootNo: String(item.bootNo || item.shoeId || item.shoe_id || item.boot_no || item.bootno || '0'),
                    roundNo: String(item.roundNo || item.round || item.round_no || item.roundId || item.roundno || '0'),
                    result: String(item.result || item.results || item.history || ''),
                    status: String(item.status || 'OPEN')
                };
            });

            lastUpdate = new Date().toISOString();
        } else {
            console.log('[⚠️ CẢNH BÁO] API không trả về dữ liệu bàn. Raw Response:', resp.data);
        }
        return baccaratData;
    } catch (error) {
        if (error.message === 'SessionExpired' || (error.response && error.response.status === 401)) {
            console.warn('[⚠️ TÁI CẤP QUYỀN] Session die! Đang đăng nhập lại tự động...');
            const relogin = await login();
            if (relogin) await goToLobby();
        } else {
            console.error('[FETCH ERROR]:', error.message);
        }
        return [];
    }
}

// Vòng lặp ngầm chạy liên tục 2.5 giây/lần
async function autoUpdate() {
    while (true) {
        try {
            await fetchBaccaratData();
        } catch (e) {
            console.error('[LOOP ERROR]:', e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 2500));
    }
}

// ======================
// KHỞI TẠO HTTP SERVER
// ======================
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Content-Type', 'application/json; charset=utf-8');
    next();
});

app.get('/api/baccarat', (req, res) => {
    res.json({
        success: true,
        total: baccaratData.length,
        lastUpdate: lastUpdate,
        data: baccaratData
    });
});

app.get('/api/baccarat/:table', (req, res) => {
    const tableName = req.params.table.trim().toLowerCase();
    const found = baccaratData.find(item => item.table.toLowerCase() === tableName || item.table.toLowerCase().includes(tableName));
    
    if (found) {
        res.json({ success: true, data: found });
    } else {
        res.json({ success: false, message: `Không thấy dữ liệu bàn: ${req.params.table}` });
    }
});

// ======================
// KHỞI CHẠY KHỞI ĐỘNG
// ======================
async function start() {
    console.log('=== KHỞI ĐỘNG HỆ THỐNG CRASH-FIX ===');
    const isOk = await login();
    if (!isOk) {
        console.error('[FATAL] Đăng nhập thất bại hoàn toàn! Kiểm tra lại tài khoản.');
        process.exit(1);
    }
    console.log('[OK] Đăng nhập thành công.');
    
    await goToLobby();
    console.log('[OK] Khởi tạo sảnh thành công.');
    
    await fetchBaccaratData();
    console.log(`[OK] Đã quét xong. Tổng số bàn lấy được: ${baccaratData.length}`);
    
    console.log('\n📊 DANH SÁCH BÀN HOẠT ĐỘNG:');
    baccaratData.forEach(item => {
        console.log(` > Bàn: ${item.table.padEnd(6)} | Phiên: Cơ ${item.bootNo.padEnd(3)} - Ván ${item.roundNo.padEnd(3)} | KQ: ${item.result.substring(0,10)}...`);
    });

    autoUpdate();
    
    const PORT = 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 API HOẠT ĐỘNG TẠI: http://localhost:${PORT}/api/baccarat`);
    });
}

start();
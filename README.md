<!-- README.md: সেটআপ ও Vercel ডিপ্লয় গাইড -->
# রিয়েল-টাইম চ্যাট অ্যাপ (Next.js 14 + Firebase)

Next.js 14 (App Router), TypeScript, Tailwind CSS, Firebase Auth ও Firestore দিয়ে তৈরি 1-on-1 রিয়েল-টাইম চ্যাট।

## ফিচার
- Google ও Email/Password লগইন/সাইনআপ
- সাইডবারে ইউজার লিস্ট + সার্চ
- 1-on-1 রিয়েল-টাইম চ্যাট (সময়, নাম, ছবি সহ)
- অনলাইন/অফলাইন স্ট্যাটাস
- লগআউট বাটন
- মোবাইল রেসপন্সিভ

## ধাপ ১: Firebase সেটআপ
1. https://console.firebase.google.com এ গিয়ে **Add project** করুন।
2. **Build → Authentication → Get started → Sign-in method** এ গিয়ে **Email/Password** ও **Google** Enable করুন।
3. **Build → Firestore Database → Create database** (Production mode) করুন।
4. Firestore-এর **Rules** ট্যাবে এই প্রজেক্টের `firestore.rules` ফাইলের পুরো কোড পেস্ট করে **Publish** করুন।
5. **Project settings (⚙️) → General → Your apps → Web (</>)** এ অ্যাপ রেজিস্টার করুন। সেখানে `firebaseConfig` এর মান পাবেন।

## ধাপ ২: লোকালি চালানো
```bash
npm install
cp .env.local.example .env.local   # তারপর .env.local এ মানগুলো বসান
npm run dev
```
http://localhost:3000 এ ওপেন করুন।

## ধাপ ৩: Vercel-এ ডিপ্লয়
1. কোডটি GitHub রিপোজিটরিতে push করুন।
2. https://vercel.com → **Add New → Project** → রিপোজিটরি Import করুন (Framework: Next.js নিজে ধরবে)।
3. **Environment Variables** এ নিচের ৬টি কী যোগ করুন:

| Name | Value কোথায় পাবেন |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | firebaseConfig → apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | firebaseConfig → authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | firebaseConfig → projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | firebaseConfig → storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | firebaseConfig → messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | firebaseConfig → appId |

4. **Deploy** চাপুন।
5. ডিপ্লয় শেষে Vercel ডোমেইন (যেমন `your-app.vercel.app`) কপি করে Firebase Console → **Authentication → Settings → Authorized domains** এ **Add domain** করুন। এটা না করলে Google লগইন কাজ করবে না।

## কালেকশন স্ট্রাকচার
- `users/{uid}` → `{ name, email, photoURL, lastSeen, online }`
- `chats/{chatId}/messages/{msgId}` → `{ text, senderId, createdAt }`
- `chatId` = দুটি uid ছোট থেকে বড় ক্রমে `_` দিয়ে জোড়া

## সমস্যা হলে
- **Google লগইন হচ্ছে না** → Authorized domains-এ ডোমেইন যোগ করেছেন কিনা দেখুন।
- **"Missing or insufficient permissions"** → `firestore.rules` Publish করেছেন কিনা দেখুন।
- **Build error: invalid-api-key** → Vercel-এ Environment Variables ঠিকভাবে বসিয়ে Redeploy করুন।

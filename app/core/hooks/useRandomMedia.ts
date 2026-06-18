"use client";

// 1. تعريف الرابط خارج دورة حياة الـ React
const VIDEO_URL = "https://youtu.be/9gK7uyTGxz8?si=GiQOXFyaSJjVO2HR&t=230";

// 2. دالة الفتح مباشرة بدون أي إجراءات فحص أو التقاط للأخطاء
const handleImageClick = () => window.open(VIDEO_URL, "_blank");

// 3. تخزين الكائن المُرجع في الذاكرة مرة واحدة فقط لمنع إعادة إنشائه مع كل Render
const staticAPI = { handleImageClick };

// 4. الـ Hook الآن لا يقوم بأي عملية سوى إرجاع المرجع الثابت
export const useRandomMedia = () => staticAPI;
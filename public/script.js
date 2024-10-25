let map;
let markers = []; // 모든 마커를 관리하는 배열
let userMarker;
let initialized = false; // 초기화 여부를 체크하는 변수

// 오늘 날짜 기준으로 3일 후, 5일 후 데이터 설정
let locations = {
    "today": [
        {
            title: "DAY 1 - 오늘의 여행",
            description: "12:00 오늘 출발하여 첫 목적지에 도착! 날씨가 너무 좋다 ☀️",
            img: "https://www.travelnbike.com/news/photo/201806/60798_94785_43.jpg",
            position: { lat: 37.539886, lng: 127.214130 }
        }
    ],
    "3days": [
        {
            title: "DAY 2 - 3일 후 여행",
            description: "14:00 3일 후 두 번째 목적지! 놀라운 풍경 😍",
            img: "https://www.visakorea.com/content/dam/VCOM/regional/ap/southkorea/travelwithvisa/marquee-travel-with-visa-800x450.jpg",
            position: { lat: 37.5651, lng: 127.2323 }
        }
    ],
    "5days": [
        {
            title: "DAY 3 - 5일 후 여행",
            description: "09:00 5일 후 마지막 목적지! 잊지 못할 순간들!",
            img: "https://cdn.pixabay.com/photo/2021/09/07/11/53/car-6603726_1280.jpg",
            position: { lat: 37.5499, lng: 127.2393 }
        }
    ]
};

// 날짜 포맷팅 함수 (YY년 MM월 DD일 형식)
function formatDate(date) {
    const year = (date.getFullYear() % 100).toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}

// 날짜 동적으로 생성하는 함수
function generateDates() {
    const dateSelector = document.getElementById('date-selector');
    const today = new Date();

    // 전체 버튼 생성 (초기화되기 전에는 비활성화)
    createDateButton(null, "전체", "전체", true);

    // 오늘 날짜
    createDateButton(today, "today", formatDate(today));

    // 3일 후
    let date3days = new Date(today);
    date3days.setDate(today.getDate() + 3);
    createDateButton(date3days, "3days", formatDate(date3days));

    // 5일 후
    let date5days = new Date(today);
    date5days.setDate(today.getDate() + 5);
    createDateButton(date5days, "5days", formatDate(date5days));
}

// 날짜 버튼 생성 함수
function createDateButton(date, dataKey, label, isDisabled = false) {
    const dateSelector = document.getElementById('date-selector');
    
    let button = document.createElement('button');
    button.classList.add('date-button');
    button.innerText = label;
    button.setAttribute('data-date', dataKey);
    button.disabled = isDisabled;
    button.onclick = () => {
        if (dataKey === "전체") {
            if (initialized) showAllMarkers(); // 초기화 후에만 전체 마커 표시
        } else {
            filterByDate(dataKey); // 날짜에 따른 필터링
            document.querySelector('.date-button[data-date="전체"]').disabled = false;
            initialized = true;
        }
    };
    
    dateSelector.appendChild(button);
}

// 모든 마커 표시 함수
function showAllMarkers() {
    const locationInfo = document.getElementById('location-info');
    const buttons = document.querySelectorAll('.date-button');

    buttons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-date') === "전체") {
            button.classList.add('selected');
        }
    });

    locationInfo.innerHTML = ""; // 기존 내용 제거

    markers.forEach(marker => marker.map = map); // 모든 마커 표시

    for (let key in locations) {
        locations[key].forEach(location => {
            let card = createLocationCard(location);
            locationInfo.appendChild(card);
        });
    }
}

// 날짜에 따른 데이터 필터링 함수 (선택된 날짜의 마커만 표시)
function filterByDate(dateKey) {
    const locationInfo = document.getElementById('location-info');
    const buttons = document.querySelectorAll('.date-button');

    buttons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-date') === dateKey) {
            button.classList.add('selected');
        }
    });

    locationInfo.innerHTML = ""; // 기존 내용을 비움
    markers.forEach(marker => marker.map = null); // 모든 마커 숨기기

    if (locations[dateKey]) {
        locations[dateKey].forEach(location => {
            const marker = addMarker(location.position, location.img, location);
            marker.map = map; // 선택된 날짜의 마커만 지도에 추가
            locationInfo.appendChild(createLocationCard(location));
        });
    } else {
        locationInfo.innerHTML = "<h2>해당 날짜에 대한 데이터가 없습니다.</h2>";
    }
}

// 마커 추가 함수 (커스텀 마커 이미지 포함 및 클릭 시 이동)
function addMarker(position, imageUrl, locationData) {
    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: position,
        map: null, // 초기에는 숨김 상태로
        content: document.createElement('div'),
        options: {
            icon: {
                url: imageUrl,
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(15, 15)
            }
        }
    });

    marker.addListener('click', () => {
        map.panTo(marker.getPosition());
        displayLocationData(locationData);
    });

    markers.push(marker);
    return marker;
}

// 위치 정보를 오른쪽 패널에 표시하는 함수
function displayLocationData(location) {
    const locationInfo = document.getElementById('location-info');
    locationInfo.innerHTML = ""; // 기존 내용을 비움
    locationInfo.appendChild(createLocationCard(location));
}

// 위치 카드 생성 함수
function createLocationCard(location) {
    let card = document.createElement('div');
    card.classList.add('location-card');
    
    let title = document.createElement('h3');
    title.innerText = location.title;
    
    let description = document.createElement('p');
    description.innerText = location.description;

    let img = document.createElement('img');
    img.src = location.img;
    img.alt = location.title;

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(img);

    return card;
}

// 내 위치 조회 버튼 추가 함수
function addLocationButton() {
    const locationButton = document.createElement('button');
    locationButton.textContent = "내 위치 찾기";
    locationButton.classList.add('location-button');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (userMarker) userMarker.setMap(null);

                userMarker = new google.maps.Marker({
                    position: userPos,
                    map: map,
                    title: "현재 위치"
                });

                map.setCenter(userPos);
            });
        } else {
            alert("위치 정보 사용 불가");
        }
    });
}

// 구글 맵 초기화 함수
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.539886, lng: 127.214130 },
        zoom: 12
    });

    addLocationButton(); // 내 위치 조회 버튼 추가
    generateDates(); // 날짜 버튼 생성
}

async function loadGoogleMapsApi() {
    try {
        const response = await fetch('/api-key');
        const data = await response.json();
        const apiKey = data.apiKey;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=initMap`;
        script.async = true;
        document.head.appendChild(script);
    } catch (error) {
        console.error('API 키를 로드할 수 없습니다:', error);
    }
}

window.onload = loadGoogleMapsApi;

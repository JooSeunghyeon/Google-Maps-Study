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

// 다크 모드와 화이트 모드 스타일 정의
const darkModeStyle = [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
];

const lightModeStyle = []; // 기본 화이트 모드 스타일 (빈 배열)

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
    
    // data-date 속성을 날짜로 설정
    if (date) {
        button.setAttribute('data-date', date.toISOString().split('T')[0]); // 날짜만 남기도록 수정
    } else {
        button.setAttribute('data-date', dataKey); // "전체" 같은 키 처리
    }
    
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

    markers.forEach(marker => marker.setMap(map)); // 모든 마커 표시

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
    markers.forEach(marker => marker.setMap(null)); // 모든 마커 숨기기

    if (locations[dateKey]) {
        locations[dateKey].forEach(location => {
            const marker = addMarker(location.position, location.img, location);
            marker.setMap(map); // 선택된 날짜의 마커만 지도에 추가
            locationInfo.appendChild(createLocationCard(location));
        });
    } else {
        locationInfo.innerHTML = "<h2>해당 날짜에 대한 데이터가 없습니다.</h2>";
    }
}

// 마커 추가 함수 (커스텀 마커 이미지 포함 및 클릭 시 이동)
function addMarker(position, imageUrl, locationData) {

    const marker = new google.maps.Marker({
        position: position,
        map: null, // 초기에는 숨김 상태로
        icon: {
            url: imageUrl,
            scaledSize: new google.maps.Size(35, 35),
            anchor: new google.maps.Point(15, 15),
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
        center: { lat: 37.539886, lng: 127.214130 }, // 경기도 하남으로 설정
        zoom: 12
    });

    addLocationButton(); // 내 위치 조회 버튼 추가
    generateDates(); // 날짜 버튼 생성
}

// 데이터 추가 후 입력 필드 초기화 및 날짜 버튼 정렬 함수
function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('img').value = '';
    document.getElementById('lat').value = '';
    document.getElementById('lng').value = '';
    document.getElementById('date').value = '';
}

// 날짜 버튼 정렬 함수
function sortDateButtons() {
    const dateSelector = document.getElementById('date-selector');
    const buttons = Array.from(dateSelector.querySelectorAll('.date-button')).filter(button => button.getAttribute('data-date') !== "전체");
    
    // 날짜순으로 정렬
    buttons.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateA - dateB; // 날짜 비교
    });
    
    // "전체" 버튼을 제외하고 정렬된 버튼을 다시 추가
    buttons.forEach(button => dateSelector.appendChild(button));
}

// 데이터 추가 기능 구현
document.getElementById('add-data-button').addEventListener('click', () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const img = document.getElementById('img').value;
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const date = document.getElementById('date').value;

    if (title && description && img && !isNaN(lat) && !isNaN(lng) && date) {
        const newLocation = {
            title: title,
            description: description,
            img: img,
            position: { lat: lat, lng: lng }
        };

        // 날짜 기반으로 locations에 데이터 추가
        if (!locations[date]) {
            locations[date] = [];
            createDateButton(new Date(date), date, formatDate(new Date(date))); // 버튼 추가
        }
        locations[date].push(newLocation);

        // 마커 추가
        const marker = addMarker(newLocation.position, newLocation.img, newLocation);
        marker.setMap(map);

        // 폼 초기화
        resetForm();

        // 날짜 버튼 정렬
        sortDateButtons();

        alert('데이터가 성공적으로 추가되었습니다!');
    } else {
        alert('모든 필드를 채워주세요!');
    }
});

// 다크 모드/화이트 모드 토글 기능
document.getElementById('toggle-theme-button').addEventListener('click', () => {
    const currentMapType = map.get('styles');
    if (currentMapType === darkModeStyle) {
        map.setOptions({ styles: lightModeStyle });
        document.getElementById('toggle-theme-button').innerText = '🌙';
    } else {
        map.setOptions({ styles: darkModeStyle });
        document.getElementById('toggle-theme-button').innerText = '☀️';
    }
});

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

// 페이지가 로드된 후 실행될 코드
window.onload = function() {
    loadGoogleMapsApi(); // Google Maps API 로드
    
    // 데이터 추가 폼 닫기 및 축소 기능 구현
    document.getElementById('close-button').addEventListener('click', () => {
        const dataInput = document.getElementById('data-input');
        
        // 먼저 hidden 클래스를 추가하여 애니메이션 적용
        dataInput.classList.add('hidden');
        
        // 애니메이션이 끝난 후에 폼을 완전히 숨기기
        setTimeout(() => {
            dataInput.style.display = 'none'; // 완전히 사라짐
        }, 300); 
    });

    document.getElementById('minimize-button').addEventListener('click', () => {
        const dataInput = document.getElementById('data-input');
        dataInput.classList.toggle('minimized'); // 폼을 축소 또는 확장
    });

};


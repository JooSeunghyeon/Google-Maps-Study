let map;
let markers = []; // 모든 마커를 관리하는 배열
let userMarker;

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

    // 전체 버튼 생성
    createDateButton(null, "전체", "전체");

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
function createDateButton(date, dataKey, label) {
    const dateSelector = document.getElementById('date-selector');
    
    let button = document.createElement('button');
    button.classList.add('date-button');
    button.innerText = label;
    button.setAttribute('data-date', dataKey);
    button.onclick = () => {
        if (dataKey === "전체") {
            showAllMarkers(); // 전체 버튼 클릭 시 모든 마커 표시
        } else {
            filterByDate(dataKey); // 날짜에 따른 필터링
        }
    };
    
    dateSelector.appendChild(button);
}

// 모든 마커 표시 함수
function showAllMarkers() {
    const locationInfo = document.getElementById('location-info');
    const buttons = document.querySelectorAll('.date-button');

    // 선택된 버튼 스타일 설정
    buttons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-date') === "전체") {
            button.classList.add('selected');
        }
    });

    locationInfo.innerHTML = ""; // 기존 내용 제거

    // 모든 마커 표시
    markers.forEach(marker => {
        marker.setMap(map); // 마커 지도에 추가
    });

    // 모든 날짜의 데이터 표시
    for (let key in locations) {
        locations[key].forEach(location => {
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

    // 모든 마커를 지도에서 제거
    markers.forEach(marker => {
        marker.setMap(null);
    });

    // 선택된 날짜의 마커만 지도에 추가
    if (locations[dateKey]) {
        locations[dateKey].forEach(location => {
            const marker = addMarker(location.position, location.img); // 마커 추가
            marker.setMap(map); // 마커를 지도에 표시

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

            locationInfo.appendChild(card);
        });
    } else {
        locationInfo.innerHTML = "<h2>해당 날짜에 대한 데이터가 없습니다.</h2>";
    }
}

// 마커 추가 함수 (커스텀 마커 이미지 포함)
function addMarker(position, imageUrl) {
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: {
            url: imageUrl,
            scaledSize: new google.maps.Size(35, 35), // 마커 크기 고정
            anchor: new google.maps.Point(15, 15) // 마커 중심 설정
        }
    });

    // 마커 배열에 추가
    markers.push(marker);

    return marker;
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

                if (userMarker) {
                    userMarker.setMap(null);
                }

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
        center: { lat: 37.539886, lng: 127.214130 }, // 경기도 하남 좌표
        zoom: 12
    });

    // 내 위치 조회 버튼 추가
    addLocationButton();
}

// 페이지 로드 시 날짜 생성
window.onload = function() {
    generateDates();
};

// 구글 맵 API가 비동기로 로드될 때 initMap 함수가 전역에서 호출될 수 있도록 설정 (콘솔에 에러가 나서 설정)
window.initMap = initMap;

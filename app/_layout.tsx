import React, { useState, useEffect } from "react"
import * as Location from "expo-location"
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native"

// 화면의 너비를 가져와 SCREEN_WIDTH에 저장
const { width: SCREEN_WIDTH } = Dimensions.get("window")

const API_KEY = "fb2d73629f45d06e33de2727757afe4f"

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
}

export default function App() {
  const [city, setCity] = useState("Seoul")
  const [days, setDays] = useState([])
  // 위치 정보 상태와 권한 상태를 관리하는 useState 훅
  const [location, setLocation] = useState(null) // 위치 정보를 저장하는 상태
  const [isOk, setIsOk] = useState(true) // 위치 권한 여부를 저장하는 상태

  // 위치 권한 요청 및 현재 위치를 가져오는 함수
  const ask = async () => {
    // 위치 권한을 요청하고, 결과를 granted에 저장
    const { granted } = await Location.requestForegroundPermissionsAsync()
    if (!granted) {
      setIsOk(false) // 권한이 거부된 경우 상태를 false로 설정
    }

    // 현재 위치(위도, 경도)를 가져옴
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 })

    // 위도와 경도를 기반으로 주소를 가져옴
    const location: any = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    )
    // 위치 정보를 상태에 저장 (이 코드에서는 사용되지 않음)
    setLocation(location)
    setCity(location[0]?.city) // 도시 이름을 상태에 저장

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    )

    const json = await response?.json()

    console.log("json", json)
    setDays(
      json.list.filter((weather: any) => {
        if (weather.dt_txt.includes("00:00:00")) {
          return weather
        }
      })
    )
  }

  // 컴포넌트가 마운트될 때 ask 함수 호출
  useEffect(() => {
    ask()
  }, [])

  return (
    <View style={styles.container}>
      {/* 도시 이름을 표시하는 뷰 */}
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
        {/* 현재 하드코딩된 도시 이름 */}
      </View>

      {/* 날씨 정보를 가로 스크롤 가능한 형태로 표시하는 ScrollView */}
      <ScrollView
        pagingEnabled // 페이지 단위로 스크롤 가능
        horizontal // 가로 방향으로 스크롤 가능
        showsHorizontalScrollIndicator={false} // 스크롤바 숨김
        contentContainerStyle={styles.weather} // 스크롤뷰 내부의 스타일
      >
        {/* 각각의 날씨 정보를 표시하는 뷰 (하드코딩된 예시) */}
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          days.map((day: any, index: number) => (
            <View key={index} style={styles.day}>
              <Text style={styles.temp}>
                {/* 날씨 정보에서 온도를 가져와서 소수점을 버린 후, 섭씨로 변환하여 표시 */}
                {Math.round(day.main.temp - 273.15)}°
              </Text>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면을 차지하는 컨테이너
    backgroundColor: "tomato", // 배경색
  },
  city: {
    flex: 1.2, // 화면의 1.2배 크기만큼 높이를 차지
    justifyContent: "center", // 세로 방향으로 가운데 정렬
    alignItems: "center", // 가로 방향으로 가운데 정렬
  },
  cityName: {
    fontSize: 56, // 글자 크기
    fontWeight: "500", // 글자 두께
  },
  weather: {}, // 스크롤뷰의 스타일 (현재는 빈 객체)
  day: {
    width: SCREEN_WIDTH, // 화면 너비만큼의 넓이를 가진 뷰
    alignItems: "center", // 가로 방향으로 가운데 정렬
  },
  temp: {
    marginTop: 50, // 위쪽 여백
    fontSize: 178, // 글자 크기 (온도 표시)
  },
  description: {
    marginTop: -30, // 위쪽 여백 (음수로 설정하여 temp와 겹치게 배치)
    fontSize: 60, // 글자 크기 (날씨 설명)
  },
  tinyText: {
    fontSize: 20,
  },
})

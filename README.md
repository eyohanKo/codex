# Baseline Fast Entry Prototype

데스크탑에서 Baseline 점수축을 초고속으로 입력하기 위한 키보드 중심 프로토타입입니다.

## Run
```bash
python3 -m http.server 4173
```
브라우저에서 `http://localhost:4173` 접속.

## Key controls
- `0~4`: 점수 입력 + 자동 다음
- `N`: not_assessed
- `Backspace`: 이전 항목
- `Ctrl+S`: draft 저장(JSON)
- `Ctrl+Enter`: confirmed 저장(JSON)

## Voice input
요약 입력 단계에서 `🎤 음성입력` 버튼으로 Web Speech API(`ko-KR`)를 사용합니다.
Chrome 계열 브라우저에서 동작합니다.


# Baseline Desktop Fast Entry Guide

## 목적
장기입원 정신과 병동용 Baseline 입력을 **모바일이 아닌 데스크탑**에서, 확장성보다 속도를 우선해 최소 클릭/최대 키보드 입력으로 처리한다.

## 1) 입력 UX 원칙 (극단적 속도 우선)
1. 한 번에 하나의 점수축만 보여주는 **풀스크린 카드(모달)** 방식 사용.
2. 카드가 뜨면 즉시 포커스가 활성화되고, `0~4` 숫자 키 입력 즉시 저장.
3. 저장 후 자동으로 다음 카드 오픈(엔터 불필요).
4. `←/→` 또는 `Shift+Tab/Tab`으로 이전/다음 항목 이동.
5. `Esc`는 현재 항목 건너뛰기(`not_assessed` 또는 임시 미입력).
6. 하단에는 진행률(`3/14`)만 표시하고 나머지 UI는 숨김.

## 2) 권장 화면 흐름
### A. Quick Baseline (핵심 11축 + 요약)
- Step 1: 환자 선택
- Step 2~12: 코어 점수축 11개를 숫자키로 연속 입력
- Step 13: `global_baseline_summary` 음성입력 텍스트박스
- Step 14: 저장/완료

### B. Extended Baseline (선택)
- 선택 점수축 3개
- risk flags 체크
- 위험 메모 및 보조 서술 필드

> 운영 권장: 회진 직후에는 Quick Baseline만 완료하고 Extended는 같은 날 보완.

## 3) 앵커 즉시 노출 방식
각 카드에서 항상 다음 3개를 동시에 표시한다.
- 도메인명(예: 사고과정/현실검증)
- 현재 선택값(없으면 `-`)
- `0~4` 전체 anchor 요약

예시 UI 텍스트:
- `0 안정적 유지`
- `1 약간의 변동`
- `2 반복적 저하`
- `3 뚜렷한 저하`
- `4 심한 저하`

핵심은 “숫자를 누르기 전에 앵커를 바로 읽을 수 있어야 한다”는 점이다.

## 4) 키보드 중심 단축키 제안
- `0~4`: 해당 점수 즉시 입력 + 다음 항목
- `N`: `not_assessed`
- `Backspace`: 이전 항목으로 이동
- `F`: 해당 항목 플래그 열기(관련 위험 플래그 빠른 체크)
- `M`: 즉시 메모 박스 열기(짧은 특이사항)
- `Ctrl+S`: 드래프트 저장
- `Ctrl+Enter`: 최종 저장

## 5) 음성입력 사용 포인트
음성입력은 점수 영역이 아니라 **짧은 자유서술 영역만** 허용한다.
- `global_baseline_summary`
- `risk_flag_note_general`
- `medical_comorbidity_sideeffect_note`

추천 구현:
1. 텍스트박스 포커스 시 자동으로 마이크 버튼 강조
2. 음성 종료 후 1회 자동 정리(문장부호/줄바꿈 정리)
3. 저장 전 미리보기 1회

## 6) 데이터 구조(현재 설계)와의 정합성
- 점수는 숫자 `0~4`만 저장
- 앵커 문구는 Options 시트에서 관리
- baseline_status는 `draft/reviewed/confirmed/inactive`
- Quick 입력과 Extended 입력을 같은 `Baseline_Master` 레코드에 단계적으로 누적

## 7) 스프레드시트 전달이 안 될 때 공유 방법
첨부 제한이 있는 채널에서는 아래 순서가 가장 안전하다.

1. **컬럼명 텍스트 붙여넣기**
   - 시트별 헤더 1행을 그대로 복사해 채팅에 붙여넣기
2. **샘플 3~5행 익명화 데이터**
   - 이름/ID 제거 후 패턴만 남겨서 붙여넣기
3. **CSV 본문으로 전달**
   - 스프레드시트에서 CSV로 내려받아 텍스트로 붙여넣기
4. **공유 링크 + 권한 설명**
   - 링크가 가능하면 "보기 가능" 권한으로 전달
5. **스크린샷 대체 전달**
   - 각 시트(컬럼 헤더 포함) 스크린샷을 여러 장으로 나눠 전달

## 8) 내가 바로 도와줄 수 있는 입력 포맷
아래 템플릿으로 보내면 즉시 AppSheet 식/검증 규칙까지 작성 가능.

```txt
[Baseline_Master Columns]
patient_id, patient_name, ...

[Daily_Rounding_Log Columns]
rounding_id, patient_id, ...

[Options Sample]
option_set, option_code, display_label_short, display_label_full, input_mode, semantic_type
sleep_score,0,안정적 유지,수면이 안정적으로 유지되며...,single_select,score
...
```

## 9) 빠른 구현 체크리스트
- [ ] 숫자키 입력 즉시 저장 + 자동 다음 카드
- [ ] 카드 진입 시 자동 포커스
- [ ] 점수 앵커 상시 노출
- [ ] 요약/위험 메모에 음성입력 버튼 기본 노출
- [ ] `Ctrl+S`, `Ctrl+Enter` 저장 동작
- [ ] Quick 완료 후 Extended 이어서 입력 버튼

export const content: Record<string, string> = {
  "github-actions-integration": `
## GitHub Actions 통합

에이전트는 Connectors 탭의 GitHub 도구를 통해 GitHub Actions 워크플로를 트리거할 수 있고, GitHub Actions는 표준 웹훅 트리거를 통해 에이전트를 트리거할 수 있습니다. 두 패턴은 잘 결합됩니다: GitHub 이벤트(PR 열림, main으로 push, 릴리스 태그됨)가 Personas 에이전트를 시작하는 웹훅을 발사하고, 에이전트가 작업을 하고, (필요한 경우) 에이전트가 출력의 일부로 워크플로를 트리거합니다.

GitHub 커넥터는 Catalog(Connections → Catalog → Developer Tools → GitHub)에 제공됩니다. 인증은 OAuth 또는 세분화된 PAT입니다 — 에이전트가 읽기 액세스만 필요한 경우 OAuth가 선호됩니다; PAT는 워크플로 발송과 같은 쓰기 작업에 잘 작동합니다.

### 핵심 포인트

- **인바운드 웹훅을 통한 GitHub → Personas** — 표준 웹훅 트리거; 에이전트의 URL로 POST하도록 GitHub 구성
- **GitHub 도구를 통한 Personas → GitHub** — 에이전트는 워크플로를 발송하고, PR에 코멘트하고, 이슈를 열고, GitHub API가 노출하는 모든 것을 할 수 있습니다
- **범위가 지정된 인증** — 주로 읽기 에이전트에 OAuth, 쓰기 작업에 세분화된 PAT; 에이전트당 최소 범위
- **실시간 상태 동기화** — 에이전트 추적은 workflow_dispatch 요청과 GitHub의 응답을 표시합니다; 에이전트는 필요한 경우 워크플로가 완료될 때까지 기다릴 수 있습니다

### 작동 방식

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

GitHub 도구는 GitHub REST/GraphQL API를 래핑하고 에이전트에 높은 수준의 액션을 노출합니다: "워크플로 발송", "PR에 코멘트", "이슈 열기", "PR 병합" 등. 에이전트의 프롬프트는 트리거에 따라 취해야 할 액션을 명명합니다; 도구는 인증, 페이로드 구성, 응답 처리를 처리합니다.

:::warning
GitHub 플랜이 지원할 때마다 클래식 PAT보다 세분화된 PAT를 사용하세요. 클래식 PAT는 광범위한 조직 전체 권한을 부여합니다; 세분화된 PAT는 특정 리포지토리와 특정 권한 범위로 제한하여 토큰이 누출되는 경우 폭발 반경을 극적으로 좁힙니다.
:::

:::tip
대상으로 위험성이 낮은 워크플로로 시작하세요 — 단지 메시지를 게시하는 "Slack에 알림" 워크플로와 같은. 에이전트 → GitHub Actions 핸드오프가 입증되면 더 높은 위험성 대상(배포, 릴리스 컷 등)으로 졸업하세요.
:::
  `,

  "gitlab-ci-cd-integration": `
## GitLab CI/CD 통합

Personas는 GitLab과 두 가지 방식으로 통합됩니다: 에이전트에 API 수준 액세스(파이프라인 상태, MR 코멘트, 이슈 관리)를 제공하는 직접 GitLab 플러그인, 그리고 기존 파이프라인 내에서 Personas 에이전트를 단계로 실행하는 GitLab CI YAML 내보내기. 둘 다 제공됩니다; 팀의 워크플로 모양에 맞는 것을 선택하세요.

플러그인(Plugins → GitLab)은 API 측 통합을 처리합니다: 설치, 인증하면 에이전트가 높은 수준의 액션(파이프라인 시작, MR에 코멘트, 이슈 관리)이 있는 \`gitlab\` 도구 표면을 받습니다. CI YAML 내보내기는 반대 방향으로 갑니다 — 에이전트가 GitLab CI 파이프라인의 단계가 되어 GitLab 러너에서 실행되며 결과가 후속 단계로 전달됩니다.

### 핵심 포인트

- **GitLab 플러그인** — API 수준 통합; 에이전트가 Connectors 탭에서 GitLab을 도구로 사용
- **CI YAML 내보내기** — 에이전트가 GitLab 파이프라인의 단계가 됨; GitLab 러너에서 실행됨
- **양방향** — GitLab 이벤트가 에이전트를 트리거할 수 있고(웹훅), 에이전트가 GitLab 파이프라인을 트리거할 수 있음(플러그인)
- **토큰 범위** — 필요한 최소 권한으로 범위가 지정된 프로젝트 액세스 토큰 또는 그룹 액세스 토큰 사용
- **트리거로서의 파이프라인 이벤트** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\`는 모두 웹훅 트리거를 통해 소비 가능

### 작동 방식

플러그인은 자격 증명 보관소에 저장된 GitLab API 토큰을 사용합니다. 에이전트가 GitLab 도구 액션을 호출하면 엔진이 API 호출을 발송하고, 응답을 캡처하고, 모델의 다음 턴을 위한 도구 결과로 다시 공급합니다.

CI 내보내기의 경우: 에이전트의 Settings 탭 열기 → Export → GitLab CI YAML. 마법사는 에이전트를 CI 실행 가능한 모양으로 래핑하는 작업 정의를 생성합니다(일반적으로 Personas CLI와 에이전트 참조가 있는 Docker 이미지). 생성된 YAML을 리포지토리의 \`.gitlab-ci.yml\`에 커밋하세요; 에이전트는 다른 CI 작업과 함께 파이프라인의 일부로 실행됩니다.

:::warning
내보낸 CI YAML은 AI 제공자 키 같은 것을 위해 자격 증명 변수를 참조합니다. 이를 프로젝트 설정에서 **마스크되고 보호되는** GitLab CI/CD 변수로 정의하세요 — YAML 파일 자체에 비밀을 하드코딩하지 마세요, 파이프라인 YAML은 리포지토리에 있고 읽기 액세스가 있는 모든 사람에게 보입니다.
:::

:::tip
플러그인이 대부분의 팀에 더 가벼운 옵션입니다. CI YAML 내보내기는 에이전트가 어쨌든 GitLab 러너 내부에서 실행되어야 할 때 가장 유용합니다(네트워크 격리, 내부 네트워크 리소스, 규정 준수 의무 인프라) — 그렇지 않으면 플러그인이 에이전트를 관찰 가능성과 디버깅이 가장 풍부한 Personas에 유지하게 합니다.
:::
  `,

  "n8n-workflow-integration": `
## n8n 워크플로 통합

n8n은 인기 있는 오픈 소스 워크플로 자동화 도구이며, Personas는 이와 양방향으로 통합됩니다. 기존 n8n 워크플로를 Personas로 템플릿으로 가져올 수 있습니다(Templates → n8n Import) — 가져오기 마법사가 워크플로 JSON을 파싱하고 n8n 노드를 동등한 Personas 에이전트, 커넥터, 트리거에 매핑합니다. 또한 HTTP/웹훅 노드를 사용하여 에이전트의 인바운드 웹훅 URL을 호출함으로써 *n8n에서* Personas 에이전트를 호출할 수 있습니다.

n8n 가져오기는 단방향이고 일회성입니다: 워크플로의 *모양*을 Personas로 가져오지만 n8n 원본을 동기화 상태로 유지하지 않습니다. 가져온 후 가져온 파이프라인은 독립적으로 편집할 수 있는 자신의 것입니다.

### 핵심 포인트

- **n8n → Personas 가져오기** — Templates → n8n Import; 워크플로 JSON 파싱, 노드를 Personas 동등물로 매핑
- **Personas → n8n 트리거** — n8n의 HTTP/웹훅 노드가 에이전트의 웹훅 트리거 URL로 POST할 수 있습니다
- **n8n → Personas 트리거** — n8n은 n8n 워크플로의 일부로 Personas 에이전트 웹훅을 호출할 수 있습니다; 에이전트의 응답(구성 가능)이 n8n으로 다시 흐릅니다
- **동기화되지 않음** — 가져온 파이프라인은 n8n 소스에서 분기됩니다; 가져오기를 일회성 시작점으로 다루세요
- **매핑된 노드 커버리지** — 임포터는 일반적인 노드(HTTP, 함수, IF, switch)를 처리합니다; 이국적인 / 커뮤니티 노드는 수동 완성을 위한 자리 표시자로 가져올 수 있습니다

### 작동 방식

가져오기 마법사는 n8n 워크플로 JSON을 읽고(워크플로에서 n8n에서 → "Download"로 내보내기), 각 노드를 가장 가까운 Personas 동등물에 매핑하고(HTTP 노드 → 도구, 함수 노드 → 에이전트, IF/switch → 조건부 라우팅 등), 결과를 수락하기 전에 미리 보는 파이프라인으로 스테이징합니다. 매핑은 최선의 노력입니다: 임포터가 자신 있게 매핑할 수 없는 모든 것은 채워야 할 메모와 함께 자리 표시자가 됩니다.

반대 방향의 경우, Personas 에이전트의 웹훅 URL은 단지 URL입니다 — 어떤 n8n HTTP 노드든 호출할 수 있습니다. 요청 본문으로 입력을 전달하면 에이전트가 처리하고 (선택적으로) 출력과 함께 동기적으로 응답합니다.

:::tip
n8n은 "서비스 간 데이터 이동" 배관에 탁월합니다; Personas는 "사고" — 분석, 결정, 작성 — 에 탁월합니다. 가장 강한 결합 워크플로는 한쪽으로 모두 하려고 시도하기보다는 오케스트레이션을 위해 n8n과 AI 기반 결정 지점을 위해 Personas 에이전트를 사용합니다.
:::
  `,

};

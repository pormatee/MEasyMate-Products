#!/data/data/com.termux/files/usr/bin/bash

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT" || exit 2

REPORT="${1:-/sdcard/Download/HORAJARN_AUTO_QA_REPORT.json}"

echo "=== HORAJARN AUTO QA ==="
echo "ROOT=$ROOT"
echo "REPORT=$REPORT"

FAIL=0

run_test(){
  FILE="$1"
  LABEL="$2"

  echo
  echo "=== $LABEL ==="

  if [ ! -f "$FILE" ]; then
    echo "MISSING=$FILE"
    FAIL=1
    return
  fi

  node "$FILE"
  CODE=$?
  echo "${LABEL}_EXIT=$CODE"

  if [ "$CODE" -ne 0 ]; then
    FAIL=1
  fi
}

run_test \
  "projects/horajarn/tests/integrated-prediction-engine-v2-test.js" \
  "V222_REGRESSION"

run_test \
  "projects/horajarn/tests/career-controlled-cutover-v2-test.js" \
  "V225_REGRESSION"

run_test \
  "projects/horajarn/tests/contextual-pair-composer-v2-test.js" \
  "V2271_REGRESSION"

run_test \
  "projects/horajarn/tests/full-natal-relationship-v2-test.js" \
  "V228_REGRESSION"

run_test \
  "projects/horajarn/tests/full-natal-narrative-refinement-v2-test.js" \
  "V2281_REGRESSION"

run_test \
  "projects/horajarn/tests/full-natal-natural-language-v2-test.js" \
  "V2282_REGRESSION"


run_test \
  "projects/horajarn/tests/full-natal-final-polish-v2-test.js" \
  "V2283_REGRESSION"

run_test \
  "projects/horajarn/tests/customer-language-v2-test.js" \
  "V2284_REGRESSION"

run_test \
  "projects/horajarn/tests/full-natal-production-cutover-v2-test.js" \
  "V229_REGRESSION"

echo
echo "=== AUTO QA MATRIX ==="
node projects/horajarn/qa/horajarn-auto-qa-v2.js --report "$REPORT"
QA=$?
echo "AUTO_QA_EXIT=$QA"

if [ "$QA" -ne 0 ]; then
  FAIL=1
fi

echo
echo "=== DIFF CHECK ==="
git diff --check
DIFF=$?
echo "DIFF_EXIT=$DIFF"

if [ "$DIFF" -ne 0 ]; then
  FAIL=1
fi

echo
echo "=== SAFETY SCOPE ==="
git status --short --untracked-files=all -- projects/horajarn/

echo
if [ "$FAIL" -eq 0 ]; then
  echo "HORAJARN_FULL_LOCAL_GATE=PASS"
  echo "READY_FOR_ANDROID_FIELD_GATE=YES"
  exit 0
else
  echo "HORAJARN_FULL_LOCAL_GATE=FAIL"
  echo "READY_FOR_ANDROID_FIELD_GATE=NO"
  exit 1
fi

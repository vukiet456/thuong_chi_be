"use strict";

function goToStep(stepNumber) {
  // Ẩn tất cả các step
  const steps = document.querySelectorAll(".step-card");
  steps.forEach((step) => {
    step.classList.remove("active");
  });

  // Hiện step được chọn
  const targetStep = document.getElementById(`step-${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add("active");
  }

  // Tự động cuộn mượt lên đầu màn hình
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

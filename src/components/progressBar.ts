
declare interface ProgressBar {
  update: (value: number, max: number) => void,
}

declare type ProgressBarProps = {
  el: Element
}

// ProgressBar Function
export function ProgressBar(props: ProgressBarProps): ProgressBar {

  let value = 0
  let maxValue = 1

  const progress = props.el.getElementsByTagName("progress").item(0)

  const redraw = () => {
    if (value < maxValue) {
      props.el.removeAttribute("hidden")
    } else {
      props.el.setAttribute("hidden", "")
    }
    if (value < 0) {
      progress.removeAttribute("value")
      progress.textContent = `0/${maxValue}`
    } else {
      progress.setAttribute("value", String(value))
      progress.textContent = `${value}/${maxValue}`
    }
    progress.setAttribute("max", String(maxValue))
  };

  progress.setAttribute("value", String(value))

  const reset = () => {
    value = 0
    maxValue = 0
    redraw()
  };

  const update = (val: number, max: number) => {
    value = val
    maxValue = max
    redraw()
  };

  redraw()

  return {
    update: update,
  };
};

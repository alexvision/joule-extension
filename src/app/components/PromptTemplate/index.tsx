import React from 'react';
import classnames from 'classnames';
import { Button, message } from 'antd';
import { confirmPrompt, rejectPrompt } from 'utils/prompt';
import './style.less';

interface Props {
  children: React.ReactNode;
  isContentCentered?: boolean;
  isConfirmDisabled?: boolean;
  beforeReject?(): any;
  beforeConfirm?(): any;
  getConfirmData?(): any;
}

interface State {
  countdown: number;
  isConfirming: boolean;
  isRejecting: boolean;
}

export default class PromptTemplate extends React.Component<Props, State> {
  state: State = {
    countdown: 3,
    isConfirming: false,
    isRejecting: false,
  };

  componentDidMount() {
    const interval = setInterval(() => {
      const countdown = this.state.countdown - 1;
      this.setState({ countdown });
      if (countdown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  render() {
    const { children, isConfirmDisabled, isContentCentered } = this.props;
    const { countdown, isConfirming, isRejecting } = this.state;
    const confirmDisabled = isConfirmDisabled || countdown > 0 || isRejecting;

    return (
      <div className="PromptTemplate">
        <div className={classnames('PromptTemplate-content', isContentCentered && 'is-centered')}>
          {children}
        </div>
        <div className="PromptTemplate-buttons">
          <Button
            onClick={this.handleReject}
            disabled={isConfirming}
            loading={isRejecting}
          >
            Reject
          </Button>
          <Button
            type="primary"
            onClick={this.handleConfirm}
            disabled={confirmDisabled}
            loading={isConfirming}
          >
            Confirm {!!countdown && `(${countdown})`}
          </Button>
        </div>
      </div>
    )
  }

  private handleReject = async () => {
    setTimeout(() => {
      this.setState({ isRejecting: true });
    }, 100);

    if (this.props.beforeReject) {
      await this.props.beforeReject();
    }
    rejectPrompt();
  }

  private handleConfirm = async () => {
    // Kick in a loader if getting confirm data takes a sec
    setTimeout(() => {
      this.setState({ isConfirming: true });
    }, 100);

    if (this.props.beforeConfirm) {
      await this.props.beforeConfirm();
    }

    let data;
    if (this.props.getConfirmData) {
      try {
        data = await this.props.getConfirmData();
      } catch(err) {
        this.setState({ isConfirming: false });
        message.error(err.message, 3);
        return;
      }
    }
    confirmPrompt(data);
  }
}
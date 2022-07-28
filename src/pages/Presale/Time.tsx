import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import Countdown from 'react-countdown';
import { paddingTwoDigits } from '../../utils/convert';
import './Time.scss';

const Time = (props) => {
  const [leftTime, setTargetTimestamp] = React.useState<number>(60000);
  React.useEffect(() => {
    setTargetTimestamp(props.saleStatus ? props.saleStatus.leftTimestamp - Date.now() : 60000);
  }, [props.saleStatus]);

  interface Props {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }

  const renderer: React.FC<Props> = ({ days, hours, minutes, seconds }) => {
    return (
      <Row className='custom-timer color-white'>
        <Col xs={6} sm={3} className='customer-timer-block'>
          <div className='customer-timer-time'>{paddingTwoDigits(days)}</div>
          <div className='customer-timer-uint'>Days</div>
        </Col>
        <Col xs={6} sm={3} className='customer-timer-block'>
          <div className='customer-timer-time'>{paddingTwoDigits(hours)}</div>
          <div className='customer-timer-uint'>Hours</div>
        </Col>
        <Col xs={6} sm={3} className='customer-timer-block'>
          <div className='customer-timer-time'>{paddingTwoDigits(minutes)}</div>
          <div className='customer-timer-uint'>Mins</div>
        </Col>
        <Col xs={6} sm={3} className='customer-timer-block'>
          <div className='customer-timer-time'>{paddingTwoDigits(seconds)}</div>
          <div className='customer-timer-uint'>Secs</div>
        </Col>
      </Row>
    );
  };

  return (
    <Countdown date={Date.now() + leftTime} renderer={renderer} />
  );
};

export default Time;
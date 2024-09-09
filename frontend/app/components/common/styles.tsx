import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  BGWhite: {
    backgroundColor: 'white',
  },
  none: {
    display: 'none',
  },

  flex: {
    display: 'flex',
  },
  flex0_5: {
    flex: 0.5,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  flex4: {
    flex: 4,
  },

  start: {
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  between: {
    justifyContent: 'space-between',
  },

  maxWidthHeight: {
    width: '100%',
    height: '100%',
  },
  width35: {
    width: '35%',
  },

  titleFont: {
    fontSize: 100,
    fontWeight: '700',
    color: '#333333',
  },
  fontSize20: {
    fontSize: 20,
  },

  button: {
    width: '30%',
    backgroundColor: '#E36161',
    borderRadius: 100,
  },
  buttonFont: {
    fontSize: 30,
    fontWeight: '600',
    color: 'white',
  },
});

export default styles;

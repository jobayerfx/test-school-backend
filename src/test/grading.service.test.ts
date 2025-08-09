import { determineAwardedLevel } from '../services/test.service';

describe('determineAwardedLevel', () => {
  it('should return "Gold" for scores >= 90', () => {
    expect(determineAwardedLevel(1, 95)).toBe('Gold');
  });

  it('should return "Silver" for scores between 75 and 89', () => {
    expect(determineAwardedLevel(2, 80)).toBe('Silver');
  });

  it('should return "Bronze" for scores between 50 and 74', () => {
    expect(determineAwardedLevel(3, 65)).toBe('Bronze');
  });

  it('should return "Fail" for scores < 50', () => {
    expect(determineAwardedLevel(2, 45)).toBe('Fail');
  });
});

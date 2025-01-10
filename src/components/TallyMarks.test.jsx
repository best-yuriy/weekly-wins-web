import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TallyMarks from './TallyMarks';

describe('TallyMarks', () => {
  it('renders tally marks for numbers up to 15', () => {
    render(<TallyMarks count={5} />);
    // Find the SVG element directly
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Verify it's the 5-mark tally by checking for 5 paths
    const paths = svg.querySelectorAll('path');
    expect(paths).toHaveLength(5);
  });

  it('switches to numerical display for numbers above 15', () => {
    render(<TallyMarks count={16} />);
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('renders correct number of tally groups', () => {
    render(<TallyMarks count={7} />);
    // Should show one group of 5 and one group of 2
    const svgs = document.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
  });

  it('renders single tally for count of 1', () => {
    render(<TallyMarks count={1} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Verify it's a single tally by checking path count
    const paths = svg.querySelectorAll('path');
    expect(paths).toHaveLength(1);
  });
});

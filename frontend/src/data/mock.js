// Mock data for Mathpix Snip Clone

export const mockSnips = [
  {
    id: '1',
    title: 'Quadratic Formula',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    markdown: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
    type: 'equation',
    createdAt: '2025-07-10T10:30:00Z',
    source: 'screenshot',
    thumbnail: 'https://latex.codecogs.com/png.latex?x%20%3D%20%5Cfrac%7B-b%20%5Cpm%20%5Csqrt%7Bb%5E2%20-%204ac%7D%7D%7B2a%7D'
  },
  {
    id: '2',
    title: 'Euler\'s Identity',
    latex: 'e^{i\\pi} + 1 = 0',
    markdown: '$e^{i\\pi} + 1 = 0$',
    type: 'equation',
    createdAt: '2025-07-09T14:20:00Z',
    source: 'screenshot',
    thumbnail: 'https://latex.codecogs.com/png.latex?e%5E%7Bi%5Cpi%7D%20%2B%201%20%3D%200'
  },
  {
    id: '3',
    title: 'Matrix Determinant',
    latex: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc',
    markdown: '$\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$',
    type: 'equation',
    createdAt: '2025-07-08T09:15:00Z',
    source: 'handwriting',
    thumbnail: 'https://latex.codecogs.com/png.latex?%5Cdet%28A%29%20%3D%20ad%20-%20bc'
  },
  {
    id: '4',
    title: 'Integral Formula',
    latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)',
    markdown: '$\\int_a^b f(x)\\,dx = F(b) - F(a)$',
    type: 'equation',
    createdAt: '2025-07-07T16:45:00Z',
    source: 'pdf',
    thumbnail: 'https://latex.codecogs.com/png.latex?%5Cint_a%5Eb%20f%28x%29%5C%2Cdx%20%3D%20F%28b%29%20-%20F%28a%29'
  },
  {
    id: '5',
    title: 'Pythagorean Theorem',
    latex: 'a^2 + b^2 = c^2',
    markdown: '$a^2 + b^2 = c^2$',
    type: 'equation',
    createdAt: '2025-07-06T11:00:00Z',
    source: 'screenshot',
    thumbnail: 'https://latex.codecogs.com/png.latex?a%5E2%20%2B%20b%5E2%20%3D%20c%5E2'
  },
  {
    id: '6',
    title: 'Taylor Series',
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
    markdown: '$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n$',
    type: 'equation',
    createdAt: '2025-07-05T08:30:00Z',
    source: 'handwriting',
    thumbnail: 'https://latex.codecogs.com/png.latex?f%28x%29%20%3D%20%5Csum_%7Bn%3D0%7D%5E%7B%5Cinfty%7D%20%5Cfrac%7Bf%5E%7B%28n%29%7D%28a%29%7D%7Bn%21%7D%28x-a%29%5En'
  }
];

export const mockDocuments = [
  {
    id: 'doc1',
    name: 'Linear Algebra Notes.pdf',
    type: 'pdf',
    pages: 24,
    size: '2.4 MB',
    convertedAt: '2025-07-10T12:00:00Z',
    status: 'converted',
    preview: 'Chapter 1: Vector Spaces\n\nA vector space V over a field F is a set equipped with two operations...'
  },
  {
    id: 'doc2',
    name: 'Calculus Homework.pdf',
    type: 'pdf',
    pages: 8,
    size: '890 KB',
    convertedAt: '2025-07-09T15:30:00Z',
    status: 'converted',
    preview: 'Problem 1: Find the derivative of f(x) = x³ + 2x² - 5x + 3...'
  },
  {
    id: 'doc3',
    name: 'Physics Equations.pdf',
    type: 'pdf',
    pages: 12,
    size: '1.1 MB',
    convertedAt: '2025-07-08T10:15:00Z',
    status: 'converted',
    preview: 'Newton\'s Laws of Motion\n\nFirst Law: An object at rest stays at rest...'
  },
  {
    id: 'doc4',
    name: 'Statistics Notes.pdf',
    type: 'pdf',
    pages: 18,
    size: '1.8 MB',
    convertedAt: '2025-07-07T09:00:00Z',
    status: 'processing',
    preview: 'Chapter 5: Probability Distributions...'
  }
];

export const mockNotes = [
  {
    id: 'note1',
    title: 'Differential Equations Summary',
    content: '# Differential Equations\n\n## First Order ODEs\n\nA first-order ordinary differential equation has the form:\n\n$$\\frac{dy}{dx} = f(x, y)$$\n\n### Separable Equations\n\nIf we can write: $\\frac{dy}{dx} = g(x)h(y)$\n\nThen: $\\int \\frac{dy}{h(y)} = \\int g(x)dx$\n\n## Second Order ODEs\n\n$$a\\frac{d^2y}{dx^2} + b\\frac{dy}{dx} + cy = f(x)$$',
    updatedAt: '2025-07-10T14:00:00Z',
    createdAt: '2025-07-05T10:00:00Z'
  },
  {
    id: 'note2',
    title: 'Complex Numbers',
    content: '# Complex Numbers\n\n## Definition\n\nA complex number $z$ is written as:\n\n$$z = a + bi$$\n\nwhere $a$ is the real part and $b$ is the imaginary part.\n\n## Euler\'s Formula\n\n$$e^{i\\theta} = \\cos\\theta + i\\sin\\theta$$\n\n## Polar Form\n\n$$z = r(\\cos\\theta + i\\sin\\theta) = re^{i\\theta}$$',
    updatedAt: '2025-07-09T11:30:00Z',
    createdAt: '2025-07-03T09:00:00Z'
  },
  {
    id: 'note3',
    title: 'Linear Transformations',
    content: '# Linear Transformations\n\n## Definition\n\nA transformation $T: V \\rightarrow W$ is linear if:\n\n1. $T(u + v) = T(u) + T(v)$\n2. $T(cu) = cT(u)$\n\n## Matrix Representation\n\nEvery linear transformation can be represented by a matrix:\n\n$$T(x) = Ax$$',
    updatedAt: '2025-07-08T16:45:00Z',
    createdAt: '2025-07-01T14:00:00Z'
  }
];

export const mockOCRResults = [
  {
    latex: '\\frac{d}{dx}[x^n] = nx^{n-1}',
    confidence: 0.98,
    formats: {
      latex: '\\frac{d}{dx}[x^n] = nx^{n-1}',
      mathml: '<math><mfrac><mi>d</mi><mi>dx</mi></mfrac><mo>[</mo><msup><mi>x</mi><mi>n</mi></msup><mo>]</mo><mo>=</mo><mi>n</mi><msup><mi>x</mi><mrow><mi>n</mi><mo>-</mo><mn>1</mn></mrow></msup></math>',
      asciimath: 'd/dx[x^n] = nx^(n-1)',
      text: 'The derivative of x to the n equals n times x to the n minus 1'
    }
  },
  {
    latex: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
    confidence: 0.95,
    formats: {
      latex: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
      mathml: '<math><munder><mi>lim</mi><mrow><mi>x</mi><mo>→</mo><mo>∞</mo></mrow></munder><mfrac><mn>1</mn><mi>x</mi></mfrac><mo>=</mo><mn>0</mn></math>',
      asciimath: 'lim_(x->oo) 1/x = 0',
      text: 'The limit as x approaches infinity of 1 over x equals 0'
    }
  },
  {
    latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    confidence: 0.97,
    formats: {
      latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
      mathml: '<math><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mi>i</mi><mo>=</mo><mfrac><mrow><mi>n</mi><mo>(</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow><mn>2</mn></mfrac></math>',
      asciimath: 'sum_(i=1)^n i = (n(n+1))/2',
      text: 'The sum from i equals 1 to n of i equals n times n plus 1 divided by 2'
    }
  }
];

export const getRandomOCRResult = () => {
  return mockOCRResults[Math.floor(Math.random() * mockOCRResults.length)];
};

export const simulateOCR = (delay = 1500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getRandomOCRResult());
    }, delay);
  });
};

export const simulatePDFConversion = (pages, delay = 2000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        pages: pages,
        formats: ['latex', 'markdown', 'docx', 'html'],
        preview: '# Converted Document\n\n## Section 1\n\nThis is the converted content from your PDF...\n\n$$E = mc^2$$'
      });
    }, delay);
  });
};
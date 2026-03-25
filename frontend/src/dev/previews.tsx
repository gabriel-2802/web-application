import { ComponentPreview, Previews } from '@react-buddy/ide-toolbox';
import { PaletteTree } from './palette';
import Home from '../pages/Home';
import { FC } from 'react';

const ComponentPreviews: FC = () => {
  return (
    <Previews palette={<PaletteTree />}>
      <ComponentPreview path="/Home">
        <Home />
      </ComponentPreview>
    </Previews>
  );
};

export default ComponentPreviews;

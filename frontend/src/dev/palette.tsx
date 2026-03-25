import { Fragment, FC } from 'react';
import {
  Category,
  Component,
  Variant,
  Palette,
} from '@react-buddy/ide-toolbox';
import MUIPalette from '@react-buddy/palette-mui';

export const PaletteTree: FC = () => (
  <Palette>
    <Category name="App">
      <Component name="Loader">
        <Variant>
          <ExampleLoaderComponent />
        </Variant>
      </Component>
    </Category>
    <MUIPalette />
  </Palette>
);

export const ExampleLoaderComponent: FC = () => {
  return <Fragment>Loading...</Fragment>;
};

import Loadable from 'react-loadable';
import PropTypes from 'prop-types';

const propTypes = {
  onRenderSuccess: PropTypes.func,
  onRenderFailure: PropTypes.func,
};

const defaultProps = {
  onRenderSuccess() {},
  onRenderFailure() {},
};

export default function createLoadableRenderer(options) {
  const LoadableRenderer = Loadable.Map(options);

  // Extends the behavior of LoadableComponent
  // generated by react-loadable
  // to provide post-render listeners
  class CustomLoadableRenderer extends LoadableRenderer {
    componentDidMount() {
      this.afterRender();
    }

    componentDidUpdate() {
      this.afterRender();
    }

    afterRender() {
      const { loaded, loading, error } = this.state;
      if (!loading) {
        if (error) {
          this.props.onRenderFailure(error);
        } else if (loaded && Object.keys(loaded).length > 0) {
          this.props.onRenderSuccess();
        }
      }
    }
  }

  CustomLoadableRenderer.defaultProps = defaultProps;
  CustomLoadableRenderer.propTypes = propTypes;
  CustomLoadableRenderer.preload = LoadableRenderer.preload;

  return CustomLoadableRenderer;
}

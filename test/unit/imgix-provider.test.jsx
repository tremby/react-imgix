import { mount, shallow } from "enzyme";
import React from "react";
import ReactImgix, { ImgixProvider } from "../../src/index";

const providerProps = {
  domain: "sdk-test.imgix.net",
  sizes: "100vw",
};

const imageProps = {
  src: "https://assets.imgix.net/examples/pione.jpg",
  sizes: "50vw",
};

describe("ImgixProvider", () => {
  test("should not have context value defined if Provider has no props", () => {
    const wrappedComponent = (
      <ImgixProvider>
        <ReactImgix {...imageProps} />
      </ImgixProvider>
    );

    const expectedProps = {
      children: (
        <ReactImgix
          src="https://assets.imgix.net/examples/pione.jpg"
          sizes="50vw"
        />
      ),
      value: {},
    };

    const renderedComponent = shallow(wrappedComponent);
    expect(renderedComponent.props()).toEqual(expectedProps);
  });

  test("should set the context value to the Provider props", () => {
    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
        <ReactImgix {...imageProps} />
      </ImgixProvider>
    );

    // ensure Provider value correctly set
    const expectedProps = {
      children: (
        <ReactImgix
          src="https://assets.imgix.net/examples/pione.jpg"
          sizes="50vw"
        />
      ),
      value: { domain: "sdk-test.imgix.net", sizes: "100vw" },
    };

    const renderedComponent = shallow(wrappedComponent);
    expect(renderedComponent.props()).toEqual(expectedProps);
  });

  test("should merge the Provider and Child props", () => {
    const modifiedProps = {
      ...imageProps,
      src: "examples/pione.jpg",
      sizes: null,
    };

    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
        <ReactImgix {...modifiedProps} />
      </ImgixProvider>
    );

    // ensure Provider and Child props are merged as intended
    const expectedProps = {
      disableSrcSet: false,
      domain: "sdk-test.imgix.net",
      height: undefined,
      imgixParams: undefined,
      onMounted: undefined,
      sizes: null,
      src: "https://sdk-test.imgix.net/examples/pione.jpg",
      width: undefined,
    };

    // The order of the childAt() needs to update if number of HOCs change.
    const renderedComponent = mount(wrappedComponent);
    const renderedProps = renderedComponent
      .childAt(0) // mergePropsHOF
      .childAt(0) // processPropsHOF
      .childAt(0) // shouldComponentUpdateHOC
      .childAt(0) // ChildComponent
      .props();
    // remove noop function that breaks tests
    renderedProps.onMounted = undefined;

    expect(renderedProps).toEqual(expectedProps);
  });

  test("should log error when has no consumers", () => {
    jest.spyOn(global.console, "error").mockImplementation(() => {});

    const wrappedComponent = <ImgixProvider {...providerProps}></ImgixProvider>;

    const expectedProps = {
      children: undefined,
      value: providerProps,
    };

    const renderedComponent = shallow(wrappedComponent);

    expect(renderedComponent.props()).toEqual(expectedProps);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "ImgixProvider must have at least one Imgix child component"
      )
    );

    jest.clearAllMocks();
  });
});

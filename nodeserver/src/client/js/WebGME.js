"use strict";

// let require load all the toplevel needed script and call us on domReady
define([  'logManager',
    'commonUtil',
    'clientUtil',
    'js/cli3nt',
    'js/Client/ClientMaster',
    'js/ObjectBrowser/TreeBrowserControl',
    'js/ObjectBrowser/JSTreeBrowserWidget',
    'js/ModelEditor/HTML/ModelEditorControl',
    'js/ModelEditor/HTML/ModelEditorView',
    'js/GraphViz/GraphVizControl',
    'js/GraphViz/GraphVizView',
    'js/ModelEditor2/ModelEditorControl',
    'js/ModelEditor2/ModelEditorView',
    'js/SimpleGraph/SVGGraphCommitCtrl',
    'js/SimpleGraph/SVGGraphView',
    'js/PartBrowser/PartBrowserView',
    'js/PartBrowser/PartBrowserControl',
    'js/Project/ProjectPanel',
    'js/Project/ProjectControl',
    'js/NetworkStatus/NetworkStatusControl',
    'js/NetworkStatus/NetworkStatusView',
    'js/Project/ProjectTitleView',
    'js/SetEditor/SetEditorView',
    'js/SetEditor/SetEditorControl'], function (logManager,
                                            commonUtil,
                                            util,
                                            Client,
                                            Core,
                                            TreeBrowserControl,
                                            JSTreeBrowserWidget,
                                            ModelEditorControl,
                                            ModelEditorView,
                                            GraphVizControl,
                                            GraphVizView,
                                            ModelEditorControl2,
                                            ModelEditorView2,
                                            CommitCtrl,
                                            CommitView,
                                            PartBrowserView,
                                            PartBrowserControl,
                                            ProjectPanel,
                                            ProjectControl,
                                            NetworkStatusControl,
                                            NetworkStatusView,
                                            ProjectTitleView,
                                            SetEditorView,
                                            SetEditorControl) {

    if (DEBUG === true) {
        logManager.setLogLevel(logManager.logLevels.ALL);
        logManager.excludeComponent("TreeBrowserControl");
        logManager.excludeComponent("JSTreeBrowserWidget");
        logManager.excludeComponent("Client");
        logManager.excludeComponent("ModelEditorSVGWidget");
        logManager.excludeComponent("ModelEditorControl");
        logManager.excludeComponent("ModelEditorSVGConnection*");

        //logManager.excludeComponent("ModelEditorModelComponent*");
        //logManager.excludeComponent("ModelWithPortsDecorator*");
        //logManager.excludeComponent("Port*");
        //logManager.excludeComponent("ModelEditorConnectionComponent*");

        //logManager.excludeComponent("ModelEditorView_*");
        //logManager.excludeComponent("HTML_ModelEditorControl");

        logManager.excludeComponent("GraphVizControl");
        logManager.excludeComponent("GraphVizObject*");


    }

    var client,
        proxy = null,
    /*tDynaTree,*/
        tJSTree,
        modelEditorSVG,
        modelEditorHTML,
        doConnect,
        lastContainerWidth = 0,
        lastContainerHeight = 0,
        resizeMiddlePane,
        graphViz,
        setActiveVisualizer,
        modelEditorView,
        mainController,
        mainView,
        currentNodeId = null,
        commitView,
        commitCtrl,
        partBrowserController,
        partBrowserView,
        projectPanel,
        projectController,
        networkStatusView,
        networkStatusControl,
        projectTitleView,
        setEditorView,
        setEditorControl;

    /*
     * Compute the size of the middle pane window based on current browser size
     */
    lastContainerWidth = 0;
    lastContainerHeight = 0;
    resizeMiddlePane = function () {
        var cW = $("#contentContainer").width(),
            cH = $("#contentContainer").height(),
            eW = 0,
            eH = 0,
            horizontalSplit = false;
        if (cW !== lastContainerWidth || cH !== lastContainerHeight) {
            $("#middlePane").outerWidth(cW - $("#leftPane").outerWidth() - $("#rightPane").outerWidth());
            lastContainerWidth = cW;
            lastContainerHeight = cH;

            //by default lay out in vertical split
            /*eW = Math.floor($("#middlePane").width() / 2);
             eH = Math.floor($("#middlePane").height());*/

            /*if (eW < 560) {
             //inner children has to be laid out under each other (horizontal split)
             eW = Math.floor($("#middlePane").width());
             eH = Math.floor($("#middlePane").height() / 2);
             horizontalSplit = true;
             }*/

            /*$("#modelEditorContainer1").outerWidth(eW).outerHeight(eH);
             $("#modelEditorContainer2").outerWidth(eW).outerHeight(eH);*/

            /******************/
            eW = Math.floor($("#middlePane").width());
            eH = Math.floor($("#middlePane").height());

            $("#modelEditorContainer1").outerWidth(eW).outerHeight(eH);
            $("#modelEditorContainer2").outerWidth(eW).outerHeight(eH);

            /******************/

            //set container position correctly
            /*if (horizontalSplit === true) {
             $("#modelEditorContainer2").offset({ "top": $("#modelEditorContainer1").outerHeight() + $("#modelEditorContainer1").position().top, "left": $("#modelEditorContainer1").position().left});
             } else {
             $("#modelEditorContainer2").offset({ "top": $("#modelEditorContainer1").position().top, "left": $("#modelEditorContainer1").outerWidth() + $("#modelEditorContainer1").position().left });
             }*/

            //$("#modelEditorContainer2").offset({ "top": $("#modelEditorContainer1").position().top, "left": $("#modelEditorContainer1").outerWidth() + $("#modelEditorContainer1").position().left });

            if (modelEditorView) {
                if ($.isFunction(modelEditorView.parentContainerSizeChanged)) {
                    modelEditorView.parentContainerSizeChanged(eW, eH);
                }
            }
        }
    };

    //hook up windows resize event
    $(window).resize(function () {
        resizeMiddlePane();
    });

    //and call if for the first time as well
    resizeMiddlePane();

    setActiveVisualizer = function (visualizer) {
        //destroy current controller and visualizer
        if (mainController) {
            mainController.destroy();
        }
        if (mainView) {
            mainView.destroy();
        }

        $("#visualizerPanel").find('a[class="btn-env"]').parent().removeClass('active');
        $("#visualizerPanel").find('a[class="btn-env"][id="' + visualizer + '"]').parent().addClass('active');

        mainController = null;
        mainView = null;
        if (visualizer === "ModelEditor") {
            mainView = new ModelEditorView("modelEditorHtml");
            mainController = new ModelEditorControl(proxy, mainView);
        } else if (visualizer === "ModelEditor2") {
            mainView = new ModelEditorView2("modelEditorHtml");
            mainController = new ModelEditorControl2(proxy, mainView);
        } else if (visualizer === "GraphViz") {
            mainView = new GraphVizView("modelEditorHtml");
            mainController = new GraphVizControl(proxy, mainView);
        }

        if (currentNodeId) {
            if (mainController) {
                mainController.selectedObjectChanged(currentNodeId);
            }
        }
    };

    $("#visualizerPanel").find('a[class="btn-env"]').click(function (event) {
        var vis = $(this).attr("id");
        setActiveVisualizer(vis);
        event.stopPropagation();
    });

    doConnect = function (callback) {


        var options = commonUtil.combinedserver;
        if (proxy === null) {
            proxy = new Core({
                proxy: location.host + options.projsrv,
                options : options.socketiopar,
                projectinfo : "*PI*" + options.mongocollection,
                defaultproject : options.mongocollection,
                faulttolerant : options.faulttolerant,
                cache : options.cache,
                log : options.logging,
                logsrv : location.host + options.logsrv
            });
            proxy.addEventListener(proxy.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
                currentNodeId = nodeId;
                if (mainController) {
                    mainController.selectedObjectChanged(currentNodeId);
                }
                if (partBrowserController) {
                    partBrowserController.selectedObjectChanged(currentNodeId);
                }
                if (setEditorControl) {
                    setEditorControl.selectedObjectChanged(currentNodeId);
                }
            });
            proxy.addEventListener(proxy.events.ACTOR_CHANGED, function () {
                if (projectTitleView) {
                    projectTitleView.refresh(proxy);
                }
            });

            //tDynaTree = new TreeBrowserControl(client, new DynaTreeBrowserWidget("tbDynaTree"));
            tJSTree = new TreeBrowserControl(proxy, new JSTreeBrowserWidget("tbJSTree"));

            //modelEditorSVG = new ModelEditorControl(client, new ModelEditorSVGWidget("modelEditorSVG"));
            //modelEditorHTML = new WidgetManager(client, $("#modelEditorHtml"));
            //modelEditorView = new ModelEditorView("modelEditorHtml");
            //modelEditorHTML = new ModelEditorControl(client, modelEditorView);
            //graphViz = new GraphVizControl(client, new GraphVizView("modelEditorSVG"));

            //hide GraphViz first and hook up radio button

            /*commit browser init*/
            /*commitView = new CommitView(document.getElementById('commitbrowser'));
             commitCtrl = new CommitCtrl(client, commitView);*/

            partBrowserView = new PartBrowserView("pPartBrowser");
            partBrowserController = new PartBrowserControl(proxy, partBrowserView);

            setEditorView = new SetEditorView("pSetEditor");
            setEditorControl = new SetEditorControl(proxy, setEditorView);

            projectPanel = new ProjectPanel("projectHistoryPanel");
            projectController = new ProjectControl(proxy, projectPanel);

            networkStatusView = new NetworkStatusView("panNetworkStatus");
            networkStatusControl = new NetworkStatusControl(proxy, networkStatusView);

            projectTitleView = new ProjectTitleView("projectInfoContainer");

            //TESTING part
            if(DEBUG === true){
                $('#leftPane').append("<div class=\"sidePaneWidget\"><div class=\"header\">TESTING</div><div id=\"tetingpanel\"><input id=\"testingbtn1\" value=\"test1\" type=\"button\"><input id=\"testingbtn2\" value=\"test2\" type=\"button\"><input id=\"testingbtn3\" value=\"test3\" type=\"button\"></div></div>");
                $('#testingbtn1').on('click',function(event){
                    proxy.testMethod(1);
                });
                $('#testingbtn2').on('click',function(event){
                    proxy.testMethod(2);
                });
                $('#testingbtn3').on('click',function(event){
                    proxy.testMethod(3);
                });
            }
            callback(null);
        }
    };

    return {
        start : function () {
            doConnect(function (err) {
                if (!err) {
                    setActiveVisualizer("ModelEditor2");
                }
            });
        }
    };
});